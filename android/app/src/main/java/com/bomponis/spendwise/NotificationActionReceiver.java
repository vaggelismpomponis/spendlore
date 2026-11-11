package com.bomponis.spendwise;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;
import android.widget.Toast;
import androidx.core.app.NotificationManagerCompat;
import org.json.JSONArray;
import org.json.JSONObject;
import java.util.Locale;

public class NotificationActionReceiver extends BroadcastReceiver {
    private static final String TAG = "NotifActionReceiver";

    public static final String ACTION_CONFIRM = "com.bomponis.spendwise.ACTION_CONFIRM";
    public static final String ACTION_SET_CATEGORY = "com.bomponis.spendwise.ACTION_SET_CATEGORY";
    public static final String ACTION_DISMISS = "com.bomponis.spendwise.ACTION_DISMISS";

    public static final String EXTRA_NOTIFICATION_ID = "notification_id";
    public static final String EXTRA_TRANSACTION_ID = "transaction_id";
    public static final String EXTRA_AMOUNT = "amount";
    public static final String EXTRA_NOTE = "note";
    public static final String EXTRA_CATEGORY = "category";
    public static final String EXTRA_MERCHANT = "merchant";
    public static final String EXTRA_TYPE = "type";
    public static final String EXTRA_DATE = "date";

    @Override
    public void onReceive(Context context, Intent intent) {
        if (intent == null || intent.getAction() == null) return;

        String action = intent.getAction();
        int notificationId = intent.getIntExtra(EXTRA_NOTIFICATION_ID, 0);
        String txId = intent.getStringExtra(EXTRA_TRANSACTION_ID);
        double amount = intent.getDoubleExtra(EXTRA_AMOUNT, 0.0);
        String note = intent.getStringExtra(EXTRA_NOTE);
        String category = intent.getStringExtra(EXTRA_CATEGORY);
        String merchant = intent.getStringExtra(EXTRA_MERCHANT);
        String type = intent.getStringExtra(EXTRA_TYPE);
        long date = intent.getLongExtra(EXTRA_DATE, System.currentTimeMillis());

        if (note == null || note.trim().isEmpty()) {
            note = (merchant != null && !merchant.trim().isEmpty()) ? merchant : "Συναλλαγή";
        }
        if (category == null || category.trim().isEmpty()) {
            category = "Φαγητό";
        }
        if (type == null || type.trim().isEmpty()) {
            type = "expense";
        }

        // 1. Immediately dismiss active notification in system tray
        if (notificationId != 0) {
            try {
                NotificationManagerCompat.from(context).cancel(notificationId);
            } catch (Exception e) {
                Log.e(TAG, "Failed to cancel notification " + notificationId, e);
            }
        }

        SharedPreferences prefs = context.getSharedPreferences("com.bomponis.spendwise.transactions", Context.MODE_PRIVATE);

        // 2. Remove transaction from pending list
        removeFromPending(prefs, txId);

        // 3. Handle Dismiss Action
        if (ACTION_DISMISS.equals(action)) {
            Log.i(TAG, "Transaction dismissed by user: " + txId);
            return;
        }

        // 4. Handle Confirm / Category Action
        if (ACTION_CONFIRM.equals(action) || ACTION_SET_CATEGORY.equals(action)) {
            saveToConfirmed(prefs, txId, amount, note, category, merchant, type, date);

            // Send local broadcast to update app in real-time if open
            try {
                Intent broadcast = new Intent("com.bomponis.spendwise.TRANSACTION_CONFIRMED");
                broadcast.setPackage(context.getPackageName());
                context.sendBroadcast(broadcast);
            } catch (Exception e) {
                Log.w(TAG, "Could not send TRANSACTION_CONFIRMED broadcast", e);
            }

            // Show native Android toast confirmation directly on device screen
            final String toastMsg;
            String amountFormatted = String.format(Locale.GERMANY, "%.2f €", amount);
            if (ACTION_SET_CATEGORY.equals(action)) {
                toastMsg = "✓ Spendlore: " + category + " " + amountFormatted;
            } else {
                toastMsg = "✓ Spendlore: Καταγράφηκε " + amountFormatted + " (" + category + ")";
            }

            new Handler(Looper.getMainLooper()).post(() -> {
                try {
                    Toast.makeText(context.getApplicationContext(), toastMsg, Toast.LENGTH_SHORT).show();
                } catch (Exception e) {
                    Log.e(TAG, "Error showing toast", e);
                }
            });

            Log.i(TAG, "Transaction confirmed via quick action: " + txId + " (" + category + ", " + amount + "€)");
        }
    }

    private void removeFromPending(SharedPreferences prefs, String txId) {
        if (txId == null) return;
        try {
            synchronized (TransactionPlugin.class) {
                String pendingStr = prefs.getString("pending", "[]");
                JSONArray pending = new JSONArray(pendingStr);
                JSONArray updated = new JSONArray();
                for (int i = 0; i < pending.length(); i++) {
                    JSONObject obj = pending.getJSONObject(i);
                    if (!txId.equals(obj.optString("id"))) {
                        updated.put(obj);
                    }
                }
                prefs.edit().putString("pending", updated.toString()).commit();
            }
        } catch (Exception e) {
            Log.e(TAG, "Error removing tx from pending", e);
        }
    }

    private void saveToConfirmed(SharedPreferences prefs, String txId, double amount, String note, String category, String merchant, String type, long date) {
        try {
            synchronized (TransactionPlugin.class) {
                String confirmedStr = prefs.getString("confirmed", "[]");
                JSONArray confirmed = new JSONArray(confirmedStr);

                // Deduplicate in case notification action button was double-tapped
                if (txId != null) {
                    for (int i = 0; i < confirmed.length(); i++) {
                        JSONObject existing = confirmed.optJSONObject(i);
                        if (existing != null && txId.equals(existing.optString("id"))) {
                            Log.d(TAG, "Confirmed transaction already queued: " + txId);
                            return;
                        }
                    }
                }

                JSONObject obj = new JSONObject();
                obj.put("id", txId);
                obj.put("amount", amount);
                obj.put("note", note);
                obj.put("category", category);
                obj.put("merchant", merchant);
                obj.put("type", type);
                obj.put("date", date);
                obj.put("confirmedVia", "notification_action");

                confirmed.put(obj);
                prefs.edit().putString("confirmed", confirmed.toString()).commit();
            }
        } catch (Exception e) {
            Log.e(TAG, "Error saving confirmed transaction", e);
        }
    }
}

