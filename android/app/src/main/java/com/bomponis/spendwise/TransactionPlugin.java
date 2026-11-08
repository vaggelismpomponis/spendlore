package com.bomponis.spendwise;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.JSObject;
import com.getcapacitor.JSArray;
import android.content.SharedPreferences;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.BroadcastReceiver;
import android.os.Build;
import android.util.Log;

@CapacitorPlugin(name = "TransactionReader")
public class TransactionPlugin extends Plugin {
    private static final String TAG = "TransactionReader";
    private BroadcastReceiver confirmedReceiver;

    @Override
    public void load() {
        super.load();
        try {
            confirmedReceiver = new BroadcastReceiver() {
                @Override
                public void onReceive(Context context, Intent intent) {
                    Log.d(TAG, "TRANSACTION_CONFIRMED broadcast received, notifying JS listeners");
                    notifyListeners("transactionsUpdated", new JSObject());
                }
            };
            IntentFilter filter = new IntentFilter("com.bomponis.spendwise.TRANSACTION_CONFIRMED");
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                getContext().registerReceiver(confirmedReceiver, filter, Context.RECEIVER_NOT_EXPORTED);
            } else {
                getContext().registerReceiver(confirmedReceiver, filter);
            }
        } catch (Exception e) {
            Log.w(TAG, "Failed to register confirmedReceiver", e);
        }
    }

    @Override
    protected void handleOnDestroy() {
        if (confirmedReceiver != null) {
            try {
                getContext().unregisterReceiver(confirmedReceiver);
                confirmedReceiver = null;
            } catch (Exception e) {
                Log.w(TAG, "Failed to unregister confirmedReceiver", e);
            }
        }
        super.handleOnDestroy();
    }

    @PluginMethod
    public void getPendingTransactions(PluginCall call) {
        try {
            Context context = getContext();
            SharedPreferences prefs = context.getSharedPreferences("com.bomponis.spendwise.transactions", Context.MODE_PRIVATE);
            
            String pendingStr = prefs.getString("pending", "[]");
            String confirmedStr = prefs.getString("confirmed", "[]");
            
            Log.d(TAG, "Pending txs: " + pendingStr + " | Confirmed txs: " + confirmedStr);
            
            JSArray pendingArr = new JSArray(pendingStr);
            JSArray confirmedArr = new JSArray(confirmedStr);
            
            // Clear both queues after reading
            prefs.edit().putString("pending", "[]").putString("confirmed", "[]").apply();
            
            JSObject result = new JSObject();
            result.put("transactions", pendingArr);
            result.put("confirmedTransactions", confirmedArr);
            call.resolve(result);
        } catch (Exception e) {
            Log.e(TAG, "Failed to read transactions", e);
            call.reject("Failed to read transactions", e);
        }
    }

    @PluginMethod
    public void setProStatus(PluginCall call) {
        try {
            boolean isPro = call.getBoolean("isPro", false);
            getContext().getSharedPreferences("com.bomponis.spendwise.transactions", Context.MODE_PRIVATE)
                .edit().putBoolean("isPro", isPro).apply();
            call.resolve();
        } catch (Exception e) {
            call.reject("Failed to set Pro status", e);
        }
    }

    @PluginMethod
    public void setMerchantRules(PluginCall call) {
        try {
            String rules = call.getString("rules", "[]");
            getContext().getSharedPreferences("com.bomponis.spendwise.transactions", Context.MODE_PRIVATE)
                .edit().putString("merchant_rules", rules).apply();
            call.resolve();
        } catch (Exception e) {
            call.reject("Failed to set merchant rules", e);
        }
    }

    @PluginMethod
    public void openNotificationSettings(PluginCall call) {
        try {
            Intent intent = new Intent("android.settings.ACTION_NOTIFICATION_LISTENER_SETTINGS");
            getContext().startActivity(intent);
            call.resolve();
        } catch (Exception e) {
            call.reject("Failed to open notification settings", e);
        }
    }

    @PluginMethod
    public void checkPermission(PluginCall call) {
        try {
            Context context = getContext();
            String packageName = context.getPackageName();
            String enabledListeners = android.provider.Settings.Secure.getString(context.getContentResolver(), "enabled_notification_listeners");
            boolean isGranted = enabledListeners != null && enabledListeners.contains(packageName);
            
            JSObject result = new JSObject();
            result.put("granted", isGranted);
            call.resolve(result);
        } catch (Exception e) {
            call.reject("Failed to check permission", e);
        }
    }
}
