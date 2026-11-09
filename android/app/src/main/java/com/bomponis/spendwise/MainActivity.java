package com.bomponis.spendwise;

import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.IntentSenderRequest;
import androidx.activity.result.contract.ActivityResultContracts;
import com.getcapacitor.BridgeActivity;
import com.google.android.material.snackbar.Snackbar;
import com.google.android.play.core.appupdate.AppUpdateInfo;
import com.google.android.play.core.appupdate.AppUpdateManager;
import com.google.android.play.core.appupdate.AppUpdateManagerFactory;
import com.google.android.play.core.appupdate.AppUpdateOptions;
import com.google.android.play.core.install.InstallStateUpdatedListener;
import com.google.android.play.core.install.model.AppUpdateType;
import com.google.android.play.core.install.model.InstallStatus;
import com.google.android.play.core.install.model.UpdateAvailability;
import java.util.Locale;

public class MainActivity extends BridgeActivity {
    private static final String TAG = "SpendloreAppUpdate";

    private AppUpdateManager appUpdateManager;
    private InstallStateUpdatedListener installStateUpdatedListener;
    private ActivityResultLauncher<IntentSenderRequest> updateLauncher;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(TransactionPlugin.class);
        super.onCreate(savedInstanceState);

        initInAppUpdate();
    }

    private void initInAppUpdate() {
        try {
            updateLauncher = registerForActivityResult(
                new ActivityResultContracts.StartIntentSenderForResult(),
                result -> {
                    if (result.getResultCode() != RESULT_OK) {
                        Log.i(TAG, "Update flow canceled or failed: " + result.getResultCode());
                    }
                }
            );

            appUpdateManager = AppUpdateManagerFactory.create(this);

            installStateUpdatedListener = state -> {
                if (state.installStatus() == InstallStatus.DOWNLOADED) {
                    showUpdateDownloadedSnackbar();
                }
            };
            appUpdateManager.registerListener(installStateUpdatedListener);

            checkAppUpdate();
        } catch (Exception e) {
            Log.w(TAG, "Failed to initialize in-app updates", e);
        }
    }

    private void checkAppUpdate() {
        if (appUpdateManager == null) return;

        appUpdateManager.getAppUpdateInfo().addOnSuccessListener(appUpdateInfo -> {
            boolean isUpdateAvailable = appUpdateInfo.updateAvailability() == UpdateAvailability.UPDATE_AVAILABLE;
            boolean isFlexibleAllowed = appUpdateInfo.isUpdateTypeAllowed(AppUpdateType.FLEXIBLE);

            if (isUpdateAvailable && isFlexibleAllowed) {
                try {
                    AppUpdateOptions options = AppUpdateOptions.newBuilder(AppUpdateType.FLEXIBLE).build();
                    appUpdateManager.startUpdateFlowForResult(
                        appUpdateInfo,
                        updateLauncher,
                        options
                    );
                } catch (Exception e) {
                    Log.e(TAG, "Failed to start flexible update flow", e);
                }
            } else if (appUpdateInfo.installStatus() == InstallStatus.DOWNLOADED) {
                showUpdateDownloadedSnackbar();
            }
        }).addOnFailureListener(e -> {
            Log.i(TAG, "No Google Play update available or running in debug/sideload mode", e);
        });
    }

    private void showUpdateDownloadedSnackbar() {
        try {
            boolean isGreek = Locale.getDefault().getLanguage().equals("el");
            String msg = isGreek
                ? "Η νέα έκδοση του Spendlore κατέβηκε."
                : "A new version of Spendlore was downloaded.";
            String action = isGreek
                ? "Επανεκκίνηση"
                : "Restart";

            Snackbar snackbar = Snackbar.make(
                findViewById(android.R.id.content),
                msg,
                Snackbar.LENGTH_INDEFINITE
            );
            snackbar.setAction(action, view -> {
                if (appUpdateManager != null) {
                    appUpdateManager.completeUpdate();
                }
            });
            snackbar.show();
        } catch (Exception e) {
            Log.e(TAG, "Error displaying update snackbar", e);
        }
    }

    @Override
    public void onResume() {
        super.onResume();
        TransactionPlugin.ensureListenerConnected(this);
        if (appUpdateManager != null) {
            appUpdateManager.getAppUpdateInfo().addOnSuccessListener(appUpdateInfo -> {
                if (appUpdateInfo.installStatus() == InstallStatus.DOWNLOADED) {
                    showUpdateDownloadedSnackbar();
                }
            });
        }
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        if (appUpdateManager != null && installStateUpdatedListener != null) {
            appUpdateManager.unregisterListener(installStateUpdatedListener);
        }
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
    }
}
