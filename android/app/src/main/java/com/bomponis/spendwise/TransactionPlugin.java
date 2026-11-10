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
import android.content.ComponentName;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.PowerManager;
import android.provider.Settings;
import android.service.notification.NotificationListenerService;
import android.os.Build;
import android.util.Log;
import java.util.ArrayList;
import java.util.List;

@CapacitorPlugin(name = "TransactionReader")
public class TransactionPlugin extends Plugin {
    private static final String TAG = "TransactionReader";
    private BroadcastReceiver confirmedReceiver;

    @Override
    public void load() {
        super.load();
        try {
            ensureListenerConnected(getContext());
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

    public static void ensureListenerConnected(Context context) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N && context != null) {
            try {
                String packageName = context.getPackageName();
                String enabledListeners = android.provider.Settings.Secure.getString(context.getContentResolver(), "enabled_notification_listeners");
                boolean isGranted = enabledListeners != null && enabledListeners.contains(packageName);
                if (isGranted) {
                    ComponentName componentName = new ComponentName(context, SMSNotificationListenerService.class);
                    try {
                        PackageManager pm = context.getPackageManager();
                        pm.setComponentEnabledSetting(
                            componentName,
                            PackageManager.COMPONENT_ENABLED_STATE_DISABLED,
                            PackageManager.DONT_KILL_APP
                        );
                        pm.setComponentEnabledSetting(
                            componentName,
                            PackageManager.COMPONENT_ENABLED_STATE_ENABLED,
                            PackageManager.DONT_KILL_APP
                        );
                    } catch (Exception ignored) {
                    }
                    NotificationListenerService.requestRebind(componentName);
                    Log.d(TAG, "Requested rebind and revived component for SMSNotificationListenerService");
                }
            } catch (Exception e) {
                Log.w(TAG, "Failed to requestRebind for SMSNotificationListenerService: " + e.getMessage());
            }
        }
    }

    @PluginMethod
    public void getPendingTransactions(PluginCall call) {
        try {
            Context context = getContext();
            ensureListenerConnected(context);
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
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
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
            if (isGranted) {
                ensureListenerConnected(context);
            }
            
            JSObject result = new JSObject();
            result.put("granted", isGranted);
            call.resolve(result);
        } catch (Exception e) {
            call.reject("Failed to check permission", e);
        }
    }

    @PluginMethod
    public void isIgnoringBatteryOptimizations(PluginCall call) {
        try {
            Context context = getContext();
            boolean isIgnoring = false;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && context != null) {
                PowerManager pm = (PowerManager) context.getSystemService(Context.POWER_SERVICE);
                if (pm != null) {
                    isIgnoring = pm.isIgnoringBatteryOptimizations(context.getPackageName());
                }
            } else {
                isIgnoring = true;
            }
            JSObject result = new JSObject();
            result.put("isIgnoring", isIgnoring);
            call.resolve(result);
        } catch (Exception e) {
            Log.w(TAG, "Failed to check battery optimization", e);
            call.reject("Failed to check battery optimization: " + e.getMessage(), e);
        }
    }

    @PluginMethod
    public void requestIgnoreBatteryOptimization(PluginCall call) {
        try {
            Context context = getContext();
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && context != null) {
                PowerManager pm = (PowerManager) context.getSystemService(Context.POWER_SERVICE);
                if (pm != null && pm.isIgnoringBatteryOptimizations(context.getPackageName())) {
                    JSObject result = new JSObject();
                    result.put("alreadyGranted", true);
                    result.put("isIgnoring", true);
                    call.resolve(result);
                    return;
                }

                try {
                    Intent intent = new Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS);
                    intent.setData(Uri.parse("package:" + context.getPackageName()));
                    intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                    context.startActivity(intent);

                    JSObject result = new JSObject();
                    result.put("requested", true);
                    result.put("isIgnoring", false);
                    call.resolve(result);
                } catch (Exception se) {
                    Log.w(TAG, "ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS failed, opening battery settings", se);
                    openBatteryOptimizationSettings(call);
                }
            } else {
                JSObject result = new JSObject();
                result.put("alreadyGranted", true);
                result.put("isIgnoring", true);
                call.resolve(result);
            }
        } catch (Exception e) {
            Log.e(TAG, "Failed in requestIgnoreBatteryOptimization", e);
            call.reject("Failed to request battery optimization: " + e.getMessage(), e);
        }
    }

    @PluginMethod
    public void openBatteryOptimizationSettings(PluginCall call) {
        try {
            Context context = getContext();
            if (context == null) {
                call.reject("Context is null");
                return;
            }

            Intent intent = null;
            if (isXiaomiDevice()) {
                Intent miuiIntent = new Intent();
                miuiIntent.setComponent(new ComponentName("com.miui.powerkeeper", "com.miui.powerkeeper.ui.HiddenAppsConfigActivity"));
                miuiIntent.putExtra("package_name", context.getPackageName());
                miuiIntent.putExtra("package_label", "Spendlore");
                miuiIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                if (canResolve(context, miuiIntent)) {
                    intent = miuiIntent;
                }
            }

            if (intent == null && Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                Intent batteryIntent = new Intent(Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS);
                batteryIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                if (canResolve(context, batteryIntent)) {
                    intent = batteryIntent;
                }
            }

            if (intent == null) {
                intent = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
                intent.setData(Uri.parse("package:" + context.getPackageName()));
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            }

            context.startActivity(intent);
            call.resolve();
        } catch (Exception e) {
            Log.e(TAG, "Failed to open battery settings", e);
            call.reject("Failed to open battery settings: " + e.getMessage(), e);
        }
    }

    @PluginMethod
    public void openAutostartSettings(PluginCall call) {
        try {
            Context context = getContext();
            if (context == null) {
                call.reject("Context is null");
                return;
            }

            Intent intent = getAutostartIntent(context);
            boolean openedDirectly = false;
            if (intent != null) {
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                try {
                    context.startActivity(intent);
                    openedDirectly = true;
                } catch (Exception ex) {
                    Log.w(TAG, "Failed to launch resolved autostart intent, falling back to app info", ex);
                }
            }

            if (!openedDirectly) {
                Intent appInfo = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
                appInfo.setData(Uri.parse("package:" + context.getPackageName()));
                appInfo.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                context.startActivity(appInfo);
            }

            JSObject ret = new JSObject();
            ret.put("openedDirectly", openedDirectly);
            call.resolve(ret);
        } catch (Exception e) {
            Log.e(TAG, "Failed to open autostart settings", e);
            call.reject("Failed to open autostart settings: " + e.getMessage(), e);
        }
    }

    @PluginMethod
    public void getBackgroundPermissionsStatus(PluginCall call) {
        try {
            Context context = getContext();
            String packageName = context.getPackageName();
            String enabledListeners = android.provider.Settings.Secure.getString(context.getContentResolver(), "enabled_notification_listeners");
            boolean notifGranted = enabledListeners != null && enabledListeners.contains(packageName);

            boolean batteryNoRestrictions = false;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && context != null) {
                PowerManager pm = (PowerManager) context.getSystemService(Context.POWER_SERVICE);
                batteryNoRestrictions = (pm != null) && pm.isIgnoringBatteryOptimizations(packageName);
            } else {
                batteryNoRestrictions = true;
            }

            boolean autostartSupported = (getAutostartIntent(context) != null) || isXiaomiDevice();
            String manufacturer = Build.MANUFACTURER != null ? Build.MANUFACTURER.toLowerCase() : "unknown";

            JSObject result = new JSObject();
            result.put("notificationListener", notifGranted);
            result.put("batteryNoRestrictions", batteryNoRestrictions);
            result.put("autostartSupported", autostartSupported);
            result.put("manufacturer", manufacturer);
            call.resolve(result);
        } catch (Exception e) {
            Log.e(TAG, "Failed to get background permissions status", e);
            call.reject("Failed to get status: " + e.getMessage(), e);
        }
    }

    private Intent getAutostartIntent(Context context) {
        List<Intent> candidates = new ArrayList<>();

        // Xiaomi / Redmi / POCO (MIUI & HyperOS) - "Background autostart"
        candidates.add(new Intent().setComponent(new ComponentName("com.miui.securitycenter", "com.miui.permcenter.autostart.AutoStartManagementActivity")));
        candidates.add(new Intent("miui.intent.action.OP_AUTO_START").addCategory(Intent.CATEGORY_DEFAULT));

        // Oppo / Realme (ColorOS / RealmeUI)
        candidates.add(new Intent().setComponent(new ComponentName("com.coloros.safecenter", "com.coloros.safecenter.permission.startup.StartupAppListActivity")));
        candidates.add(new Intent().setComponent(new ComponentName("com.coloros.safecenter", "com.coloros.privacypermissionsentry.PermissionTopActivity")));
        candidates.add(new Intent().setComponent(new ComponentName("com.oppo.safe", "com.oppo.safe.permission.startup.StartupAppListActivity")));

        // Vivo / iQOO (FuntouchOS / OriginOS)
        candidates.add(new Intent().setComponent(new ComponentName("com.iqoo.secure", "com.iqoo.secure.ui.phoneoptimize.AddWhiteListActivity")));
        candidates.add(new Intent().setComponent(new ComponentName("com.vivo.permissionmanager", "com.vivo.permissionmanager.activity.BgStartUpManagerActivity")));
        candidates.add(new Intent().setComponent(new ComponentName("com.iqoo.secure", "com.iqoo.secure.ui.phoneoptimize.BgStartUpManager")));

        // Huawei / Honor (EMUI / MagicOS)
        candidates.add(new Intent().setComponent(new ComponentName("com.huawei.systemmanager", "com.huawei.systemmanager.startupmgr.ui.StartupNormalAppListActivity")));
        candidates.add(new Intent().setComponent(new ComponentName("com.huawei.systemmanager", "com.huawei.systemmanager.optimize.bootstart.BootStartActivity")));

        // Samsung (OneUI)
        candidates.add(new Intent().setComponent(new ComponentName("com.samsung.android.lool", "com.samsung.android.sm.ui.battery.BatteryActivity")));

        // Asus
        candidates.add(new Intent().setComponent(new ComponentName("com.asus.mobilemanager", "com.asus.mobilemanager.autostart.AutoStartActivity")));

        // OnePlus
        candidates.add(new Intent().setComponent(new ComponentName("com.oneplus.security", "com.oneplus.security.chainlaunch.view.ChainLaunchAppListActivity")));

        for (Intent intent : candidates) {
            if (canResolve(context, intent)) {
                return intent;
            }
        }
        return null;
    }

    private boolean canResolve(Context context, Intent intent) {
        if (context == null || intent == null) return false;
        try {
            return context.getPackageManager().resolveActivity(intent, PackageManager.MATCH_DEFAULT_ONLY) != null;
        } catch (Exception e) {
            return false;
        }
    }

    private boolean isXiaomiDevice() {
        String m = Build.MANUFACTURER != null ? Build.MANUFACTURER.toLowerCase() : "";
        String b = Build.BRAND != null ? Build.BRAND.toLowerCase() : "";
        return m.contains("xiaomi") || m.contains("redmi") || m.contains("poco") ||
               b.contains("xiaomi") || b.contains("redmi") || b.contains("poco");
    }

    @PluginMethod
    public void updateWidget(PluginCall call) {
        try {
            Context context = getContext();
            String amount = call.getString("amount", "—");
            String label = call.getString("label", "Safe today");
            boolean isOver = call.getBoolean("isOver", false);
            boolean hasIncome = call.getBoolean("hasIncome", true);

            SharedPreferences prefs = context.getSharedPreferences(SafeToBurnWidgetProvider.PREFS_NAME, Context.MODE_PRIVATE);
            prefs.edit()
                .putString(SafeToBurnWidgetProvider.KEY_AMOUNT, amount)
                .putString(SafeToBurnWidgetProvider.KEY_LABEL, label)
                .putBoolean(SafeToBurnWidgetProvider.KEY_IS_OVER, isOver)
                .putBoolean(SafeToBurnWidgetProvider.KEY_HAS_INCOME, hasIncome)
                .apply();

            SafeToBurnWidgetProvider.updateAllWidgets(context);

            call.resolve();
        } catch (Exception e) {
            Log.e(TAG, "Failed to update widget", e);
            call.reject("Failed to update widget: " + e.getMessage(), e);
        }
    }
}
