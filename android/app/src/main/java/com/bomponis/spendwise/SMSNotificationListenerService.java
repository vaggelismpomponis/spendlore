package com.bomponis.spendwise;

import android.service.notification.NotificationListenerService;
import android.service.notification.StatusBarNotification;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Intent;
import android.os.Bundle;
import android.os.Build;
import android.content.SharedPreferences;
import android.content.Context;
import android.content.ComponentName;
import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;
import org.json.JSONArray;
import org.json.JSONObject;
import java.util.Date;
import java.util.UUID;
import java.util.LinkedHashSet;
import java.util.Locale;
import java.util.regex.Pattern;
import java.util.regex.Matcher;
import android.util.Log;

public class SMSNotificationListenerService extends NotificationListenerService {

    private static final String TAG = "SpendWiseNotifListener";
    public static final String CHANNEL_ID = "spendlore_transactions";

    // Deduplication buffer for recent notification signatures
    private static final LinkedHashSet<String> sProcessedSignatures = new LinkedHashSet<>();
    private static final int MAX_DEDUP_CACHE = 50;

    // Explicitly blocked packages (never read notifications from these)
    private static final String[] BLOCKED_PACKAGES = {
        "com.whatsapp",
        "com.facebook.orca",
        "com.facebook.katana",
        "com.facebook.lite",
        "com.instagram.android",
        "org.telegram.messenger",
        "com.viber.voip",
        "com.discord",
        "com.slack",
        "com.twitter.android",
        "com.zhiliaoapp.musically",
        "com.tiktok",
        "com.snapchat.android",
        "com.linkedin.android",
        "com.reddit.frontpage",
        "com.skype.raider",
        "org.thoughtcrime.securesms",
        "android",
        "com.android.systemui",
        "com.android.vending",
        "com.google.android.youtube",
        "com.spotify.music",
        "com.netflix.mediaclient"
    };

    // Whitelisted banking, digital wallet & SMS packages
    private static final String[] ALLOWED_PACKAGES = {
        // Digital Wallets & Fintech
        "com.google.android.gms",
        "com.google.android.apps.walletnfcrel",
        "com.google.android.apps.wallet",
        "com.google.android.apps.gpay",
        "com.google.android.apps.nfc.payment",
        "com.samsung.android.spay",
        "com.samsung.android.raja.spay",
        "com.revolut.revolut",
        "com.transferwise.android",
        "com.paypal.android.p2pmobile",
        "de.number26.android",
        "co.uk.getmondo",
        "com.imaginecurve.curve.prd",
        "com.klarna.mobile",
        "co.starlingbank.android",
        "com.bunq.android",

        // Food Delivery & Mobility
        "com.wolt.android",
        "gr.efood",
        "com.efood",
        "gr.cosmote.box",
        "com.cosmote.box",
        "com.ubercab",
        "taxi.android.client",
        "ee.mtakso.client",

        // Voucher, Meal & Benefit Cards
        "fr.edenred.myedenred",
        "com.edenred.ticketrestaurant",
        "com.edenred.gr",
        "com.edenred.greece",
        "com.edenred",
        "com.ticketrestaurant",
        "com.sodexo",
        "com.pluxee",
        "com.pluxee.gr",
        "com.pluxee.greece",
        "com.uphellas",
        "gr.uphellas",
        "com.up.chequedejeuner",

        // Greek Banks & Fintech
        "gr.winbank.mobile",
        "com.winbank.mobile",
        "gr.winbank.pay",
        "gr.alphabank.myalphamobile",
        "gr.alphabank.alpha",
        "gr.alphabank.wallet",
        "gr.eurobank.ebanking",
        "gr.eurobank.mobile",
        "gr.eurobank.smartapp",
        "gr.nbg.mobilebanking",
        "gr.nbg.nbgmobilebanking",
        "com.vivawallet.consumer",
        "com.vivawallet",
        "com.vivawallet.wallet",
        "com.vivawallet.merchant",
        "gr.payzy.app",
        "gr.payzy",
        "com.cosmote.payzy",
        "gr.optimabank.mobile",
        "gr.atticabank.mobile",

        // Major European & International Banks
        "uk.co.santander.santanderUK",
        "es.bancosantander.apps",
        "com.barclays.android.barclaysmobilebanking",
        "uk.co.hsbc.hsbcukmobilebanking",
        "com.htsu.hsbcpersonalbanking",
        "com.chase.sig.android",
        "com.infonow.bofa",
        "com.wf.wellsfargomobile",
        "com.citi.citimobile",
        "com.konylabs.capitalone",
        "com.bnpparibas.mescomptes",
        "com.ing.banking",
        "nl.ing.mobile",
        "de.deutschebank.pbc.mobilebanking",
        "com.intesasanpaolo.android.combo",
        "com.bbva.bbvacontigo",
        "com.bankofcyprus.mobile",
        "com.hellenicbank.mobile",

        // SMS & Messenger Apps (where bank SMS arrives)
        "com.google.android.apps.messaging",
        "com.samsung.android.messaging",
        "com.android.mms",
        "com.android.messaging",
        "com.miui.sms",
        "com.miui.mms",
        "com.huawei.message",
        "com.coloros.mms",
        "com.heytap.mms",
        "com.vivo.mms",
        "com.oppo.mms"
    };

    // Regex for OTP, 2FA, verification codes (STRICT REJECTION)
    private static final Pattern OTP_PATTERN = Pattern.compile(
        "(?i)(?:\\b(?:otp|one[- ]time|passcode|verification\\s*code|security\\s*code|auth\\s*code|authorization\\s*code|temporary\\s*password|use\\s*code|do\\s*not\\s*share)\\b|" +
        "κωδικ[οό][ςυ]?\\s*(?:μιας\\s*χρ[ήη]σης|ασφαλ[εεί]ας|επιβεβα[ίι]ωσης|εισ[όο]δου|σ[υύ]νδεσης)?|" +
        "μην\\s*τον\\s*κοινοποιε[ίι]τε|μην\\s*αποκαλ[υύ]πτετε)"
    );

    // Regex for Marketing, promos, loan offers, discounts (STRICT REJECTION)
    private static final Pattern MARKETING_PATTERN = Pattern.compile(
        "(?i)(?:\\b(?:invite\\s*a\\s*friend|refer\\s*a\\s*friend|earn\\s*up\\s*to|cashback\\s*offer|loan\\s*offer|pre[- ]approved|special\\s*offer|discount|apply\\s*now|personal\\s*loan|win\\s*[$€£]|save\\s*on\\s*your\\s*next)\\b|" +
        "προσφορ[άα]|[έε]κπτωσ[ηη]|δ[άα]νειο|προ[έε]γκρισ[ηη]|κερδ[ίι]στε|ανακαλ[ύυ]ψτε|επιβρ[άα]βευσ[ηη]|ν[έε]ο\\s*πρ[όο]γραμμα|επωφεληθε[ίι]τε)"
    );

    // Regex for Security, logins, statements, card status (STRICT REJECTION)
    private static final Pattern SECURITY_PATTERN = Pattern.compile(
        "(?i)(?:\\b(?:new\\s*login|login\\s*detected|unrecognized\\s*device|password\\s*changed|statement\\s*(?:is\\s*)?ready|monthly\\s*statement|card\\s*(?:activated|frozen|unblocked)|pin\\s*changed|biometrics\\s*enabled)\\b|" +
        "ν[έε]α\\s*ε[ίι]σοδος|σ[ύυ]νδεση\\s*απ[όο]|αλλαγ[ήη]\\s*κωδικο[ύυ]|απ[όο]σπασμα\\s*λογαριασμο[ύυ]|ενεργοποι[ήη]θηκε\\s*η\\s*κ[άα]ρτα|μπλοκαρ[ίι]στηκε\\s*η\\s*κ[άα]ρτα|αλλαγ[ήη]\\s*pin)"
    );

    // Regex for positive transaction verbs (REQUIRED)
    private static final Pattern TRANSACTION_ACTION_PATTERN = Pattern.compile(
        "(?i)(?:\\b(?:paid|payment|purchase|charged|spent|debit|withdrawal|sent|transferred|refund|received|deposit|credited|salary|pos)\\b|" +
        "αγορ[άα]|χρ[έε]ωσ[ηη]|πληρωμ[ήη]|πληρ[ώω]θηκε|χρε[ώω]θηκε|αν[άα]ληψη|εξ[όο]φληση|συναλλαγ[ήη]|έξοδο|μεταφορ[άα]|απεστ[άα]λη|στε[ίι]λατε|εγκρ[ίι]θηκε|" +
        "κατ[άα]θεση|π[ίι]στωσ[ηη]|πιστ[ώω]θηκε|ελ[ήη]φθη|επιστροφ[ήη]|μισθοδοσ[ίι]α|έσοδο|λ[άα]βατε|πληρωθ[ήη]κατε|" +
        "xreosi|agora|pliromi|synallagi|katathesi|pistosi|egkrithike)"
    );

    // Regex for digital wallet card payment indicators (e.g. "with Ticket Restaurant® ••2331", "με Visa ••1234")
    private static final Pattern WALLET_CARD_PATTERN = Pattern.compile(
        "(?i)(?:\\b(?:with|using|via)\\s+[\\w\\s®.-]*(?:••|\\.{2,}|\\*+)\\d{2,4}|" +
        "\\b(?:με|μ[έε]σω)\\s+[\\w\\sΑ-Ωα-ωά-ώ®.-]*(?:••|\\.{2,}|\\*+|κ[άα]ρτα)\\s*\\d{0,4}|" +
        "(?:••|\\.{2,}|\\*+)\\d{2,4})"
    );

    // Regex for monetary amount with currency (REQUIRED)
    private static final Pattern AMOUNT_CURRENCY_PATTERN = Pattern.compile(
        "(?i)(?:[€$£]|EUR|USD|GBP|euro|ευρ[ώω])\\s*\\d+(?:[.,]\\d{1,2})?|\\d+(?:[.,]\\d{1,2})?\\s*(?:[€$£]|EUR|USD|GBP|euro|ευρ[ώω])|\\b\\d+[.,]\\d{2}\\b"
    );

    // Bank identification keywords for SMS messages
    private static final Pattern SMS_BANK_IDENTIFIER_PATTERN = Pattern.compile(
        "(?i)(?:winbank|piraeus|πειραιως|πειραιώς|alpha|αλφα|άλφα|eurobank|γιουρομπανκ|nbg|εθνικη|εθνική|revolut|viva|paypal|wise|optima|attica|" +
        "edenred|ticket|restaurant|payzy|pluxee|sodexo|uphellas|wolt|efood|curve|klarna|" +
        "mastercard|visa|maestro|diners|amex|pos|\\bkarta\\b|\\bκάρτα\\b|\\bcard\\b|\\biban\\b|λογαριασμ|\\bbank\\b|τραπεζ|" +
        "xreosi|agora|pliromi|synallagi|χρ[έε]ωσ[ηη]|αγορ[άα]|πληρωμ[ήη]|συναλλαγ[ήη])"
    );

    @Override
    public void onCreate() {
        super.onCreate();
        createNotificationChannel();
    }

    @Override
    public void onListenerConnected() {
        super.onListenerConnected();
        Log.i(TAG, "SMSNotificationListenerService connected successfully");
    }

    @Override
    public void onListenerDisconnected() {
        super.onListenerDisconnected();
        Log.w(TAG, "SMSNotificationListenerService disconnected! Requesting rebind...");
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            try {
                requestRebind(new ComponentName(this, SMSNotificationListenerService.class));
                Log.i(TAG, "Rebind requested for SMSNotificationListenerService");
            } catch (Exception e) {
                Log.e(TAG, "Failed to requestRebind onListenerDisconnected", e);
            }
        }
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                CHANNEL_ID,
                "Συναλλαγές Spendlore",
                NotificationManager.IMPORTANCE_HIGH
            );
            channel.setDescription("Άμεση επιβεβαίωση και κατηγοριοποίηση συναλλαγών");
            channel.enableVibration(true);
            channel.setShowBadge(true);
            NotificationManager nm = getSystemService(NotificationManager.class);
            if (nm != null) {
                nm.createNotificationChannel(channel);
            }
        }
    }

    @Override
    public void onNotificationPosted(StatusBarNotification sbn) {
        if (sbn == null) return;

        String packageName = sbn.getPackageName();
        if (packageName == null || !isAllowedPackage(packageName)) {
            return;
        }

        Notification notification = sbn.getNotification();
        if (notification == null || notification.extras == null) {
            return;
        }

        Bundle extras = notification.extras;
        String title = extras.getString(Notification.EXTRA_TITLE);
        CharSequence textCharSeq = extras.getCharSequence(Notification.EXTRA_TEXT);
        CharSequence bigTextCharSeq = extras.getCharSequence(Notification.EXTRA_BIG_TEXT);
        CharSequence subTextCharSeq = extras.getCharSequence(Notification.EXTRA_SUB_TEXT);

        String text = textCharSeq != null ? textCharSeq.toString() : "";
        String bigText = bigTextCharSeq != null ? bigTextCharSeq.toString() : "";
        String subText = subTextCharSeq != null ? subTextCharSeq.toString() : "";

        if (title == null) title = "";

        String combined = (title + " " + text + " " + bigText + " " + subText).trim();
        if (combined.length() < 5) {
            return;
        }

        // Deduplication check
        String signature = packageName + "_" + title + "_" + combined.hashCode();
        synchronized (sProcessedSignatures) {
            if (sProcessedSignatures.contains(signature)) {
                Log.d(TAG, "Duplicate notification skipped: " + signature);
                return;
            }
            if (sProcessedSignatures.size() >= MAX_DEDUP_CACHE) {
                String oldest = sProcessedSignatures.iterator().next();
                sProcessedSignatures.remove(oldest);
            }
            sProcessedSignatures.add(signature);
        }

        // 1. Strict Negative Check: OTP / 2FA / Passcodes
        if (OTP_PATTERN.matcher(combined).find()) {
            Log.d(TAG, "Rejected: OTP / 2FA verification message");
            return;
        }

        // 2. Strict Negative Check: Marketing / Promotions
        if (MARKETING_PATTERN.matcher(combined).find()) {
            Log.d(TAG, "Rejected: Marketing / promotional notification");
            return;
        }

        // 3. Strict Negative Check: Security / Logins / Statements
        if (SECURITY_PATTERN.matcher(combined).find()) {
            Log.d(TAG, "Rejected: Security / system alert notification");
            return;
        }

        // 4. Positive Check: Transaction action keyword or digital wallet/financial app indicator
        boolean isFinancialApp = isFinancialPackage(packageName);
        boolean hasActionVerb = TRANSACTION_ACTION_PATTERN.matcher(combined).find();
        boolean hasWalletCard = WALLET_CARD_PATTERN.matcher(combined).find();

        if (!hasActionVerb && !hasWalletCard && !isFinancialApp) {
            Log.d(TAG, "Rejected: No transaction action verb, wallet card pattern, or financial source");
            return;
        }

        // 5. Positive Check: Monetary amount pattern must be present
        if (!AMOUNT_CURRENCY_PATTERN.matcher(combined).find()) {
            Log.d(TAG, "Rejected: No monetary amount pattern found");
            return;
        }

        // 6. Extra verification for SMS apps: Must identify a bank or financial institution
        boolean isSmsApp = isSmsPackage(packageName);
        if (isSmsApp && !SMS_BANK_IDENTIFIER_PATTERN.matcher(combined).find()) {
            Log.d(TAG, "Rejected: SMS message does not originate from a financial institution");
            return;
        }

        Log.i(TAG, "Valid financial transaction notification confirmed from: " + packageName);
        saveAndPostTransaction(packageName, title, text, bigText, subText, combined);
    }

    private boolean isAllowedPackage(String pkg) {
        if (pkg == null) return false;
        String p = pkg.toLowerCase();

        // 1. Definite blocked check
        for (String blocked : BLOCKED_PACKAGES) {
            if (p.startsWith(blocked)) {
                return false;
            }
        }

        // 2. Allow any SMS/MMS messaging app
        if (isSmsPackage(p)) {
            return true;
        }

        // 3. Whitelist match
        for (String allowed : ALLOWED_PACKAGES) {
            if (p.equals(allowed) || p.startsWith(allowed)) {
                return true;
            }
        }

        // 4. Financial & payment heuristic
        return isFinancialPackage(p);
    }

    private boolean isFinancialPackage(String pkg) {
        if (pkg == null) return false;
        String p = pkg.toLowerCase();
        if (p.contains("bank") || p.contains("wallet") || p.contains("fintech") || p.contains("card") ||
            p.contains("wolt") || p.contains("efood") || p.contains("edenred") || p.contains("ticketrestaurant") ||
            p.contains("payzy") || p.contains("pluxee") || p.contains("sodexo") || p.contains("uphellas") ||
            p.contains("revolut") || p.contains("paypal") || p.contains("wise") || p.contains("curve") ||
            p.contains("klarna") || p.contains("monzo") || p.contains("starling") || p.contains("bunq") ||
            p.contains("n26") || p.contains("viva") || p.contains("gpay") || p.contains("spay") || p.contains("gms")) {
            return true;
        }
        if (p.contains("pay") && !p.contains("play") && !p.contains("player") && !p.contains("game")) {
            return true;
        }
        return false;
    }

    private boolean isWalletPackage(String pkg) {
        if (pkg == null) return false;
        String p = pkg.toLowerCase();
        return p.contains("wallet") || p.contains("gpay") || p.contains("spay") || p.contains("gms") ||
               p.contains("wolt") || p.contains("edenred") || p.contains("ticketrestaurant") ||
               p.contains("payzy") || (p.contains("pay") && !p.contains("play"));
    }

    private boolean isSmsPackage(String pkg) {
        if (pkg == null) return false;
        String p = pkg.toLowerCase();
        return p.contains("messaging") || p.contains("mms") || p.contains("sms") ||
               (p.contains("message") && !p.contains("messenger"));
    }

    private void saveAndPostTransaction(String packageName, String title, String text, String bigText, String subText, String combined) {
        try {
            SharedPreferences prefs = getSharedPreferences("com.bomponis.spendwise.transactions", Context.MODE_PRIVATE);
            String existing = prefs.getString("pending", "[]");
            JSONArray jsonArray = new JSONArray(existing);

            String txId = UUID.randomUUID().toString();
            long now = new Date().getTime();

            JSONObject obj = new JSONObject();
            obj.put("id", txId);
            obj.put("packageName", packageName);
            obj.put("title", title);
            obj.put("text", text);
            obj.put("bigText", bigText);
            obj.put("subText", subText);
            obj.put("date", now);

            jsonArray.put(obj);

            SharedPreferences.Editor editor = prefs.edit();
            editor.putString("pending", jsonArray.toString());
            boolean success = editor.commit();

            Log.i(TAG, "Financial transaction saved to pending. Pending count: " + jsonArray.length() + " Success: " + success);

            // Check if user has Pro enabled
            boolean isPro = prefs.getBoolean("isPro", true);
            if (!isPro) {
                Log.d(TAG, "Interactive notification omitted because user is not Pro");
                return;
            }

            // Post Interactive Notification with Quick-Action Chips
            postQuickActionNotification(txId, packageName, title, combined, now);

        } catch (Exception e) {
            Log.e(TAG, "Error saving pending financial transaction", e);
        }
    }

    private void postQuickActionNotification(String txId, String packageName, String title, String combined, long date) {
        try {
            createNotificationChannel();

            double amount = extractAmountValue(combined);
            if (amount <= 0.0) {
                Log.w(TAG, "Could not extract valid amount for notification: " + combined);
                return;
            }

            String merchant = extractMerchantName(title, combined, packageName);
            CategoryInfo categoryInfo = predictCategory(merchant, combined);
            String category = categoryInfo.category;
            String chipLabel = categoryInfo.chipLabel;

            int notifId = Math.abs(txId.hashCode());

            // 1. Content Intent: Tapping notification body opens Spendlore to review/edit
            Intent openIntent = new Intent(this, MainActivity.class);
            openIntent.setFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
            openIntent.putExtra("notification_id", notifId);
            openIntent.putExtra("transaction_id", txId);
            PendingIntent pendingOpen = PendingIntent.getActivity(
                this,
                notifId * 7 + 4,
                openIntent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
            );

            // 2. Action 1: [Επιβεβαίωση] - logs directly with auto-predicted category
            Intent confirmIntent = new Intent(this, NotificationActionReceiver.class);
            confirmIntent.setAction(NotificationActionReceiver.ACTION_CONFIRM);
            confirmIntent.putExtra(NotificationActionReceiver.EXTRA_NOTIFICATION_ID, notifId);
            confirmIntent.putExtra(NotificationActionReceiver.EXTRA_TRANSACTION_ID, txId);
            confirmIntent.putExtra(NotificationActionReceiver.EXTRA_AMOUNT, amount);
            confirmIntent.putExtra(NotificationActionReceiver.EXTRA_NOTE, merchant);
            confirmIntent.putExtra(NotificationActionReceiver.EXTRA_CATEGORY, category);
            confirmIntent.putExtra(NotificationActionReceiver.EXTRA_MERCHANT, merchant);
            confirmIntent.putExtra(NotificationActionReceiver.EXTRA_TYPE, "expense");
            confirmIntent.putExtra(NotificationActionReceiver.EXTRA_DATE, date);
            PendingIntent pendingConfirm = PendingIntent.getBroadcast(
                this,
                notifId * 7 + 1,
                confirmIntent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
            );

            // 3. Action 2: [Φαγητό / Καφές] (or contextual category chip)
            Intent chipIntent = new Intent(this, NotificationActionReceiver.class);
            chipIntent.setAction(NotificationActionReceiver.ACTION_SET_CATEGORY);
            chipIntent.putExtra(NotificationActionReceiver.EXTRA_NOTIFICATION_ID, notifId);
            chipIntent.putExtra(NotificationActionReceiver.EXTRA_TRANSACTION_ID, txId);
            chipIntent.putExtra(NotificationActionReceiver.EXTRA_AMOUNT, amount);
            chipIntent.putExtra(NotificationActionReceiver.EXTRA_NOTE, merchant);
            chipIntent.putExtra(NotificationActionReceiver.EXTRA_CATEGORY, category);
            chipIntent.putExtra(NotificationActionReceiver.EXTRA_MERCHANT, merchant);
            chipIntent.putExtra(NotificationActionReceiver.EXTRA_TYPE, "expense");
            chipIntent.putExtra(NotificationActionReceiver.EXTRA_DATE, date);
            PendingIntent pendingChip = PendingIntent.getBroadcast(
                this,
                notifId * 7 + 2,
                chipIntent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
            );

            // 4. Action 3: [Αγνόηση] - dismisses notification and drops transaction
            Intent dismissIntent = new Intent(this, NotificationActionReceiver.class);
            dismissIntent.setAction(NotificationActionReceiver.ACTION_DISMISS);
            dismissIntent.putExtra(NotificationActionReceiver.EXTRA_NOTIFICATION_ID, notifId);
            dismissIntent.putExtra(NotificationActionReceiver.EXTRA_TRANSACTION_ID, txId);
            PendingIntent pendingDismiss = PendingIntent.getBroadcast(
                this,
                notifId * 7 + 3,
                dismissIntent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
            );

            String formattedAmount = String.format(Locale.GERMANY, "%.2f €", amount);
            String notifTitle = (merchant != null && !merchant.isEmpty() && !merchant.equals("Συναλλαγή"))
                ? (merchant + " • " + formattedAmount)
                : formattedAmount;

            NotificationCompat.Builder builder = new NotificationCompat.Builder(this, CHANNEL_ID)
                .setSmallIcon(R.drawable.ic_stat_spendlore)
                .setContentTitle(notifTitle)
                .setContentText("Εντοπίστηκε πληρωμή. Επιλέξτε ενέργεια:")
                .setContentIntent(pendingOpen)
                .setAutoCancel(true)
                .setPriority(NotificationCompat.PRIORITY_HIGH)
                .setDefaults(NotificationCompat.DEFAULT_ALL)
                .setColor(0xFF7C3AED)
                .addAction(0, "Επιβεβαίωση", pendingConfirm)
                .addAction(0, chipLabel, pendingChip)
                .addAction(0, "Αγνόηση", pendingDismiss);

            NotificationManagerCompat.from(this).notify(notifId, builder.build());
            Log.i(TAG, "Interactive notification posted successfully: ID " + notifId + " (" + notifTitle + ")");

        } catch (SecurityException se) {
            Log.w(TAG, "POST_NOTIFICATIONS permission not granted yet", se);
        } catch (Exception e) {
            Log.e(TAG, "Failed to post interactive notification", e);
        }
    }

    private double extractAmountValue(String text) {
        try {
            // Remove dates and card numbers to avoid false matches
            String cleaned = text.replaceAll("\\b\\d{1,2}[/.-]\\d{1,2}[/.-]\\d{2,4}\\b", " ");
            cleaned = cleaned.replaceAll("(?i)(?:στις|at|ώρα|time)\\s+\\d{1,2}[:.]\\d{2}", " ");
            cleaned = cleaned.replaceAll("(?i)(?:\\*+|\\.{2,}|κάρτα\\s*|card\\s*)\\d{4}\\b", " ");

            // Pattern for currency prefix/postfix supporting European & US thousand separators
            Pattern p = Pattern.compile("(?i)(?:[€$£]|EUR|USD|GBP|euro|ευρ[ώω])\\s*(\\d{1,3}(?:[.,]\\d{3})*(?:[.,]\\d{1,2})|\\d+(?:[.,]\\d{1,2})?)|(\\d{1,3}(?:[.,]\\d{3})*(?:[.,]\\d{1,2})|\\d+(?:[.,]\\d{1,2})?)\\s*(?:[€$£]|EUR|USD|GBP|euro|ευρ[ώω])|\\b(\\d+[.,]\\d{2})\\b");
            Matcher m = p.matcher(cleaned);
            if (m.find()) {
                String val = m.group(1);
                if (val == null) val = m.group(2);
                if (val == null) val = m.group(3);

                if (val != null) {
                    val = val.trim();
                    // Handle European 1.250,50 vs US 1,250.50
                    if (val.contains(".") && val.contains(",")) {
                        if (val.lastIndexOf('.') > val.lastIndexOf(',')) {
                            // US 1,250.50 -> remove commas
                            val = val.replace(",", "");
                        } else {
                            // European 1.250,50 -> remove dots, replace comma with dot
                            val = val.replace(".", "").replace(",", ".");
                        }
                    } else if (val.contains(",")) {
                        val = val.replace(',', '.');
                    }
                    return Double.parseDouble(val);
                }
            }
        } catch (Exception e) {
            Log.d(TAG, "Amount parsing exception", e);
        }
        return 0.0;
    }

    private String extractMerchantName(String title, String combined, String packageName) {
        String cleanTitle = (title != null) ? title.trim() : "";
        // Strip elapsed time suffixes e.g. " • 7m", " · 2h", " • now", " · τώρα"
        cleanTitle = cleanTitle.replaceAll("\\s*[•·-]\\s*\\d+\\s*(?:m|min|h|s|sec|τώρα|now|πριν)\\b.*$", "").trim();
        cleanTitle = cleanTitle.replaceAll("\\s*[•·-]\\s*(?:now|τώρα)\\b.*$", "").trim();
        String lowerTitle = cleanTitle.toLowerCase();

        // 1. If title is a known merchant (not just the bank or system app)
        if (!cleanTitle.isEmpty() && !lowerTitle.contains("wallet") && !lowerTitle.contains("bank") &&
            !lowerTitle.contains("revolut") && !lowerTitle.contains("messages") && !lowerTitle.contains("sms") &&
            !lowerTitle.contains("google play") && !lowerTitle.contains("google services")) {
            return cleanTitle;
        }

        // 2. Specific merchant pattern: "Wolt €6.39 with Ticket Restaurant"
        Pattern walletPattern = Pattern.compile("^([A-Za-z0-9\\sΑ-Ωα-ωά-ώ&'./\\-]+?)(?:\\s+[•·-]\\s*|\\s+)(?:[€$£]|EUR|USD)?\\s*\\d+(?:[.,]\\d{1,2})?\\s*(?:[€$£]|EUR|USD)?\\s*(?:with|με|using)", Pattern.CASE_INSENSITIVE);
        Matcher wm = walletPattern.matcher(combined);
        if (wm.find()) {
            String m = wm.group(1).trim();
            if (m.length() >= 2) return m;
        }

        // 3. Greek patterns: "στην επιχείρηση SKLAVENITIS" or "στο SKLAVENITIS"
        Pattern greekPattern = Pattern.compile("(?:στην\\s+επιχείρηση|στο|σε|από)\\s+([A-Za-z0-9\\sΑ-Ωα-ωά-ώ&'./\\-]+?)(?:\\s+(?:με|στις|την|για|μέσω|\\.|,|$))", Pattern.CASE_INSENSITIVE);
        Matcher gm = greekPattern.matcher(combined);
        if (gm.find()) {
            String m = gm.group(1).trim();
            if (m.length() >= 2 && !m.equalsIgnoreCase("eur") && !m.equalsIgnoreCase("euro")) return m;
        }

        // 4. English patterns: "paid to X", "spent at X", "purchase at X"
        Pattern engPattern = Pattern.compile("(?:paid\\s+to|spent\\s+at|purchase\\s+at)\\s+([A-Za-z0-9\\s&'./\\-]+?)(?:\\s+(?:with|using|on|via|\\.|,|$))", Pattern.CASE_INSENSITIVE);
        Matcher em = engPattern.matcher(combined);
        if (em.find()) {
            String m = em.group(1).trim();
            if (m.length() >= 2) return m;
        }

        if (!cleanTitle.isEmpty()) {
            return cleanTitle;
        }

        return "Συναλλαγή";
    }

    private static class CategoryInfo {
        final String category;
        final String chipLabel;

        CategoryInfo(String category, String chipLabel) {
            this.category = category;
            this.chipLabel = chipLabel;
        }
    }

    private String normalizeForMatching(String s) {
        if (s == null) return "";
        try {
            String normalized = java.text.Normalizer.normalize(s, java.text.Normalizer.Form.NFD);
            normalized = normalized.replaceAll("\\p{InCombiningDiacriticalMarks}+", "");
            return normalized.toLowerCase(Locale.ROOT).trim();
        } catch (Exception e) {
            return s.toLowerCase(Locale.ROOT).trim();
        }
    }

    private CategoryInfo predictCategory(String merchant, String combined) {
        // 0. Priority: Custom user merchant rules & aliasing
        try {
            SharedPreferences prefs = getSharedPreferences("com.bomponis.spendwise.transactions", Context.MODE_PRIVATE);
            String rulesJson = prefs.getString("merchant_rules", "[]");
            JSONArray rulesArray = new JSONArray(rulesJson);
            String targetText = normalizeForMatching(merchant + " " + combined);

            for (int i = 0; i < rulesArray.length(); i++) {
                JSONObject rule = rulesArray.getJSONObject(i);
                String pattern = rule.optString("merchantPattern", "");
                String category = rule.optString("category", "");
                boolean exactMatch = rule.optBoolean("exactMatch", false);
                if (pattern.isEmpty() || category.isEmpty()) continue;

                String[] keywords = pattern.split("[,|]");
                for (String kw : keywords) {
                    String normKw = normalizeForMatching(kw.trim());
                    if (normKw.isEmpty()) continue;

                    String stem = (normKw.endsWith("ς") && normKw.length() > 3)
                        ? normKw.substring(0, normKw.length() - 1) : null;

                    if (exactMatch) {
                        String normMerchant = normalizeForMatching(merchant);
                        if (normMerchant.equals(normKw) || (stem != null && normMerchant.equals(stem))) {
                            Log.d(TAG, "Custom merchant rule matched (exact): '" + kw + "' -> " + category);
                            return new CategoryInfo(category, category);
                        }
                    } else {
                        if (targetText.contains(normKw) || (stem != null && targetText.contains(stem))) {
                            Log.d(TAG, "Custom merchant rule matched: '" + kw + "' -> " + category);
                            return new CategoryInfo(category, category);
                        }
                    }
                }
            }
        } catch (Exception e) {
            Log.w(TAG, "Error matching custom merchant rules", e);
        }

        String text = (merchant + " " + combined).toLowerCase();

        // 1. Food & Delivery -> Chip: [Φαγητό / Καφές] (per user explicit specification)
        if (text.matches(".*(?:wolt|efood|e-food|goody|mcdonald|kfc|pizza|domino|burger|grill|restaurant|ταβερν|σουβλακ|φαγητο|delivery|everest|gregory|γρηγορη).*")) {
            return new CategoryInfo("Φαγητό", "Φαγητό / Καφές");
        }

        // 2. Coffee -> Chip: [Φαγητό / Καφές]
        if (text.matches(".*(?:starbucks|mikel|coffee|caf[eé]|espresso|freddo|καφε).*")) {
            return new CategoryInfo("Καφές", "Φαγητό / Καφές");
        }

        // 3. Supermarket -> Chip: [Σούπερ Μάρκετ]
        if (text.matches(".*(?:sklavenitis|σκλαβενιτη|lidl|ab\\b|αβ\\b|vassilopoulos|βασιλοπουλος|masoutis|μασουτη|market\\s*in|galaxias|γαλαξια|bazaar|supermarket|super\\s*market|παντοπωλειο|μαναβικο|κρεοπωλειο).*")) {
            return new CategoryInfo("Σούπερ Μάρκετ", "Σούπερ Μάρκετ");
        }

        // 4. Fuel & Gas -> Chip: [Βενζίνη]
        if (text.matches(".*(?:shell|bp|eko|εκο|avin|revoil|elin|ελιν|fuel|gas\\s*station|petrol|βενζιν|διοδια|attiki\\s*odos).*")) {
            return new CategoryInfo("Βενζίνη", "Βενζίνη");
        }

        // 5. Bills & Utilities -> Chip: [Λογαριασμοί]
        if (text.matches(".*(?:dei|δεη|cosmote|vodafone|nova|eydap|ευδαπ|deddie|δεδδηε|ppc|taxisnet|efka|εφκα|bill|λογαριασμ|ρευμα|νερο).*")) {
            return new CategoryInfo("Λογαριασμοί", "Λογαριασμοί");
        }

        // 6. Entertainment -> Chip: [Διασκέδαση]
        if (text.matches(".*(?:netflix|spotify|cinema|village|odeon|steam|playstation|youtube|disney|σινεμα|θεατρο).*")) {
            return new CategoryInfo("Διασκέδαση", "Διασκέδαση");
        }

        // 7. Health & Pharmacy -> Chip: [Υγεία]
        if (text.matches(".*(?:pharmacy|farmakeio|φαρμακει|doctor|γιατρ|κλινικ|νοσοκομει).*")) {
            return new CategoryInfo("Υγεία", "Υγεία");
        }

        // Default: Category "Φαγητό", Chip "[Φαγητό / Καφές]"
        return new CategoryInfo("Φαγητό", "Φαγητό / Καφές");
    }
}
