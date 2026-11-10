package com.bomponis.spendwise;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.util.Log;

public class BootReceiver extends BroadcastReceiver {
    private static final String TAG = "SpendloreBoot";

    @Override
    public void onReceive(Context context, Intent intent) {
        if (intent == null)
            return;
        Log.i(TAG, "System event received: " + intent.getAction());
        try {
            TransactionPlugin.ensureListenerConnected(context);
        } catch (Exception e) {
            Log.w(TAG, "Failed to ensure listener connected on boot", e);
        }
    }
}
