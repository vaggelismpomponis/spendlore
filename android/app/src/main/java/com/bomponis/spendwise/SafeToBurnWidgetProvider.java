package com.bomponis.spendwise;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;
import android.os.Build;
import android.widget.RemoteViews;

public class SafeToBurnWidgetProvider extends AppWidgetProvider {

    public static final String PREFS_NAME = "com.bomponis.spendwise.widget";
    public static final String KEY_AMOUNT = "stb_amount";
    public static final String KEY_LABEL = "stb_label";
    public static final String KEY_IS_OVER = "stb_is_over";
    public static final String KEY_HAS_INCOME = "stb_has_income";

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId);
        }
    }

    public static void updateAppWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        String amount = prefs.getString(KEY_AMOUNT, "—");
        String label = prefs.getString(KEY_LABEL, "Safe today");
        boolean isOver = prefs.getBoolean(KEY_IS_OVER, false);
        boolean hasIncome = prefs.getBoolean(KEY_HAS_INCOME, true);

        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_safe_to_burn);

        views.setTextViewText(R.id.widget_amount, amount);
        views.setTextViewText(R.id.widget_label, label);

        // Adjust color based on status
        if (!hasIncome) {
            views.setTextColor(R.id.widget_amount, 0xFF94A3B8); // Slate 400
        } else if (isOver) {
            views.setTextColor(R.id.widget_amount, 0xFFF43F5E); // Rose 500
        } else {
            views.setTextColor(R.id.widget_amount, 0xFFFFFFFF); // Clean White
        }

        int flags = PendingIntent.FLAG_UPDATE_CURRENT;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            flags |= PendingIntent.FLAG_IMMUTABLE;
        }

        // Tap on the widget background -> Opens Spendlore main screen
        Intent mainIntent = new Intent(context, MainActivity.class);
        mainIntent.setAction(Intent.ACTION_MAIN);
        mainIntent.addCategory(Intent.CATEGORY_LAUNCHER);
        mainIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_RESET_TASK_IF_NEEDED);
        PendingIntent mainPendingIntent = PendingIntent.getActivity(context, 0, mainIntent, flags);
        views.setOnClickPendingIntent(R.id.widget_root, mainPendingIntent);

        // Tap on "+" button -> Deep link to Add Transaction (Expense) in 1 second!
        Intent addIntent = new Intent(context, MainActivity.class);
        addIntent.setAction(Intent.ACTION_VIEW);
        addIntent.setData(Uri.parse("com.bomponis.spendwise://shortcut?action=add-expense"));
        addIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent addPendingIntent = PendingIntent.getActivity(context, 1, addIntent, flags);
        views.setOnClickPendingIntent(R.id.widget_button_add, addPendingIntent);

        appWidgetManager.updateAppWidget(appWidgetId, views);
    }

    public static void updateAllWidgets(Context context) {
        try {
            AppWidgetManager appWidgetManager = AppWidgetManager.getInstance(context);
            ComponentName componentName = new ComponentName(context, SafeToBurnWidgetProvider.class);
            int[] appWidgetIds = appWidgetManager.getAppWidgetIds(componentName);
            if (appWidgetIds != null && appWidgetIds.length > 0) {
                for (int id : appWidgetIds) {
                    updateAppWidget(context, appWidgetManager, id);
                }
            }
        } catch (Exception e) {
            // Log or ignore if widget is not placed
        }
    }
}
