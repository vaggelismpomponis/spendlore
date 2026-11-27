/**
 * Single Source of Truth for Application Release Notes & "What's New" Entries
 *
 * Modeled after modern editorial release drawers (e.g. Sure personal finance).
 * Every release entry contains:
 * - version: String matching APP_VERSION
 * - build: Integer matching APP_BUILD_NUMBER
 * - date: Release date string (YYYY-MM-DD)
 * - title_el / title_en: Release headline with version and highlights
 * - summary_el / summary_en: Executive lead paragraph
 * - sections: Array of feature blocks containing title, narrative description,
 *             rich previewType (or image URL), and caption.
 *
 * NOTE: Admin panel, operations dashboard, moderation tools, and internal
 * telemetry features must NEVER be included here. Release notes are strictly
 * tailored to end-user personal finance management features.
 */

export const RELEASE_NOTES = [
    {
        version: '1.1.64',
        build: 76,
        date: '2026-11-27',
        title_el: 'Spendlore v1.1.64 - Έξυπνες Push Υπενθυμίσεις & Εβδομαδιαία Σύνοψη',
        title_en: 'Spendlore v1.1.64 - Smart Push Reminders & Weekly Summary',
        summary_el: 'Η έκδοση 1.1.64 φέρνει έξυπνες push ειδοποιήσεις σε Android και Web/PWA για να μην ξεχνάτε ποτέ τα έξοδα της ημέρας, με βραδινή υπενθύμιση μόνο όταν δεν έχετε καταχωρήσει συναλλαγή, μεσημεριανό check-in και κυριακάτικη σύνοψη 7 ημερών.',
        summary_en: 'Version 1.1.64 introduces cross-platform push notifications on Android and Web/PWA so you never miss daily expenses, featuring smart inactivity-aware evening reminders, friendly midday check-ins, and Sunday 7-day summaries.',
        sections: [
            {
                title_el: 'Έξυπνες Καθημερινές Υπενθυμίσεις Εξόδων',
                title_en: 'Smart Daily Expense Reminders',
                desc_el: 'Λάβετε διακριτικό μεσημεριανό check-in μέσα στη μέρα και μία έξυπνη βραδινή υπενθύμιση που αποστέλλεται μόνο εφόσον δεν έχετε καταχωρήσει έξοδα εκείνη την ημέρα. Με ένα πάτημα ανοίγει απευθείας η φόρμα προσθήκης εξόδου.',
                desc_en: 'Receive a friendly midday check-in and a smart evening reminder sent only when no expenses have been logged that day. Tapping any reminder opens the expense entry form directly.',
                previewType: 'modal_portal',
                caption_el: 'Καθημερινή συνέπεια καταγραφής χωρίς ενοχλητικές ειδοποιήσεις.',
                caption_en: 'Consistent daily tracking without noisy notifications.'
            },
            {
                title_el: 'Εβδομαδιαία Σύνοψη Εξόδων Κάθε Κυριακή',
                title_en: 'Weekly Expense Summary Every Sunday',
                desc_el: 'Κάθε Κυριακή λαμβάνετε μία καθαρή σύνοψη με τον αριθμό και το συνολικό ποσό των εξόδων των τελευταίων 7 ημερών, με άμεση μετάβαση στα Στατιστικά για αναλυτική επισκόπηση.',
                desc_en: 'Every Sunday, receive a clear summary of your 7-day expense count and total amount, with one-tap navigation straight to your Statistics view.',
                previewType: 'mobile_polish',
                caption_el: 'Άμεση εικόνα της εβδομαδιαίας πορείας σας.',
                caption_en: 'Instant visibility into your weekly spending pace.'
            },
            {
                title_el: 'Αποδοχή 1ης Φοράς & Ρυθμίσεις Ανά Λογαριασμό',
                title_en: 'Explicit Opt-In & Account-Synced Preferences',
                desc_el: 'Επιλέξτε αν θέλετε να ενεργοποιήσετε τις ειδοποιήσεις από το νέο παράθυρο καλωσορίσματος και προσαρμόστε τις ώρες ή τους τύπους υπενθυμίσεων από τις Γενικές Ρυθμίσεις, με αυτόματο συγχρονισμό σε όλες τις συσκευές σας.',
                desc_en: 'Choose whether to enable reminders from the first-time consent prompt and customize hours or notification types anytime in General Settings, synced across all your devices.',
                previewType: 'categories_redesign',
                caption_el: 'Πλήρης έλεγχος ωρών και συγχρονισμός σε κινητό και Web.',
                caption_en: 'Full schedule control synced seamlessly across mobile and Web.'
            }
        ]
    },
    {
        version: '1.1.63',
        build: 75,
        date: '2026-11-23',
        title_el: 'Spendlore v1.1.63 - Έξυπνη Κατηγοριοποίηση & Ανασχεδιασμός Ρυθμίσεων',
        title_en: 'Spendlore v1.1.63 - Smart Categorization & Settings Redesign',
        summary_el: 'Η έκδοση 1.1.63 φέρνει έξυπνη κατηγοριοποίηση τραπεζικών συναλλαγών χωρίς λανθασμένες προεπιλογές, πλήρη ανασχεδιασμό των σελίδων Υποστήριξης και Νομικών Όρων με πρότυπα Hallmark, κλείδωμα του Κανόνα Αναμονής 72 Ωρών και ανανεωμένη εικονογραφία.',
        summary_en: 'Version 1.1.63 delivers smart bank transaction categorization without false default categories, an executive Hallmark redesign for Support and Legal settings pages, a streamlined 72-hour cooling-off rule, and refined iconography.',
        sections: [
            {
                title_el: 'Έξυπνη Κατηγοριοποίηση & Διόρθωση Προεπιλογών',
                title_en: 'Smart Categorization & Fallback Resolution',
                desc_el: 'Οι αυτόματα εντοπισμένες συναλλαγές που δεν ταιριάζουν σε συγκεκριμένο κανόνα εμπόρου αποδίδονται πλέον ορθά στην κατηγορία «Άλλο» αντί να καταχωρούνται αυθαίρετα ως φαγητό, διασφαλίζοντας απόλυτη ακρίβεια στους προϋπολογισμούς σας.',
                desc_en: 'Bank transactions that do not match a specific merchant rule now accurately fall back to "Other" rather than arbitrarily defaulting to food, ensuring reliable budget reporting.',
                previewType: 'categories_redesign',
                caption_el: 'Ακριβής απόδοση κατηγοριών και αξιόπιστος έλεγχος δαπανών.',
                caption_en: 'Accurate category assignment and trustworthy expense tracking.'
            },
            {
                title_el: 'Ανασχεδιασμός Hallmark στις Σελίδες Ρυθμίσεων',
                title_en: 'Executive Hallmark Redesign for Settings',
                desc_el: 'Οι σελίδες Τεχνικής Υποστήριξης, Πολιτικής Απορρήτου και Όρων Χρήσης ανασχεδιάστηκαν με ενοποιημένα breadcrumbs πλοήγησης, κάρτες υψηλής αντίθεσης και άμεση υποβολή αιτημάτων.',
                desc_en: 'Technical Support, Privacy Policy, and Terms of Service have been fully reimagined with unified breadcrumbs, elevated contrast cards, and a streamlined ticket submission console.',
                previewType: 'feedback_toolbar',
                caption_el: 'Καθαρή δομή, άμεση υποστήριξη και ενιαία αισθητική.',
                caption_en: 'Clean layout, immediate support, and unified design.'
            },
            {
                title_el: 'Κλείδωμα Κανόνα Αναμονής 72 Ωρών',
                title_en: 'Focused 72-Hour Cooling-Off Rule',
                desc_el: 'Η λειτουργία αναμονής εστιάζει αποκλειστικά στο βέλτιστο ψυχολογικό παράθυρο των 72 ωρών (3 ημέρες), αποτρέποντας παρορμητικές αγορές με απλό και στοχευμένο τρόπο.',
                desc_en: 'The cooling-off workflow now concentrates exclusively on the scientifically proven 72-hour impulse window, streamlining impulse spend prevention.',
                previewType: 'modal_portal',
                caption_el: 'Στοχευμένος έλεγχος παρορμητικών αγορών με 72 ώρες αναμονή.',
                caption_en: 'Targeted impulse spend control with a dedicated 72-hour timer.'
            },
            {
                title_el: 'Ανανεωμένη Εικονογραφία Υποστήριξης & UI Polish',
                title_en: 'Refined Support Iconography & Visual Polish',
                desc_el: 'Ενσωμάτωση του επίσημου εικονιδίου ακουστικών υποστήριξης, ασφαλής εμφάνιση της προεπιλογής συστήματος στο θέμα χωρίς αναδίπλωση τίτλων και βελτιστοποιήσεις διεπαφής.',
                desc_en: 'Updated official headphones support iconography across profiles and settings, alongside safe single-line truncation for theme selector badges.',
                previewType: 'mobile_polish',
                caption_el: 'Επαγγελματική αισθητική και προσεγμένες λεπτομέρειες.',
                caption_en: 'Professional aesthetic and meticulous polish across the interface.'
            }
        ]
    },
    {
        version: '1.1.62',
        build: 74,
        date: '2026-11-23',
        title_el: 'Spendlore v1.1.62 - Βελτιστοποίηση Αρχικής Οθόνης & Νέα Εμφάνιση Θέματος',
        title_en: 'Spendlore v1.1.62 - Streamlined Mobile Home & Interactive Theme Picker',
        summary_el: 'Η έκδοση 1.1.62 φέρνει ανανεωμένη αρχική οθόνη στο mobile με άμεση πρόσβαση στις πρόσφατες συναλλαγές, νέο διαδραστικό επιλογέα θέματος με μικρογραφίες, ενσωμάτωση του Safe-to-Burn και απτική ανάδραση (haptic feedback) στην πλοήγηση.',
        summary_en: 'Version 1.1.62 introduces a streamlined mobile home experience with instant transaction visibility, a redesigned interactive theme picker with real-time previews, seamless Safe-to-Burn daily budget tracking, and haptic feedback across navigation.',
        sections: [
            {
                title_el: 'Καθαρή & Συμπυκνωμένη Αρχική Οθόνη Mobile',
                title_en: 'Streamlined & Airy Mobile Home Layout',
                desc_el: 'Η διάταξη της αρχικής οθόνης βελτιστοποιήθηκε ώστε τα οικονομικά μεγέθη να προβάλλονται σε μία ενιαία γραμμή, εξοικονομώντας πάνω από 200px χώρου και φέρνοντας τις πρόσφατες συναλλαγές άμεσα στο οπτικό σας πεδίο.',
                desc_en: 'The mobile home screen has been reorganized with a unified cashflow metrics row, saving over 200px of vertical space and bringing recent transactions into immediate view without scrolling.',
                previewType: 'mobile_polish',
                caption_el: 'Άμεση ορατότητα συναλλαγών και καθαρότερη οικονομική επισκόπηση.',
                caption_en: 'Immediate transaction visibility and clearer financial overview.'
            },
            {
                title_el: 'Νέος Επιλογέας Εμφάνισης & Θέματος',
                title_en: 'Interactive Theme Selector with Previews',
                desc_el: 'Επιλέξτε ανάμεσα σε Φωτεινό, Σκοτεινό ή Προσαρμογή Συστήματος μέσα από ένα κομψό παράθυρο με διαδραστικές προεπισκοπήσεις του ταμπλό σε κάθε λειτουργία.',
                desc_en: 'Switch effortlessly between Light, Dark, or System mode using an elegant new modal featuring realistic dashboard preview cards.',
                previewType: 'theme',
                caption_el: 'Οπτική επιβεβαίωση εμφάνισης πριν από την επιλογή.',
                caption_en: 'Visual preview of the dashboard appearance before selecting.'
            },
            {
                title_el: 'Ενσωμάτωση Safe-to-Burn & Κανόνα 72h',
                title_en: 'Safe-to-Burn & 72h Rule Integration',
                desc_el: 'Παρακολουθήστε το ασφαλές ημερήσιο όριο εξόδων απευθείας από την αρχική οθόνη και διαχειριστείτε τις παρορμητικές αγορές με άμεση πρόσβαση στον Κανόνα 72 Ωρών.',
                desc_en: 'Monitor your safe daily spending allowance directly from the home screen and manage impulse urges with 1-tap access to the 72-Hour Cooling-Off Rule.',
                previewType: 'budgets',
                caption_el: 'Έξυπνος έλεγχος ημερήσιων δαπανών και αποφυγή περιττών εξόδων.',
                caption_en: 'Smart daily spend control and impulse purchase prevention.'
            },
            {
                title_el: 'Απτική Ανάδραση (Haptic Feedback) & Πλοήγηση',
                title_en: 'Haptic Feedback & Breadcrumbs Navigation',
                desc_el: 'Απολαύστε φυσική αίσθηση αφής κατά την επιλογή καρτελών και προσθήκη συναλλαγών στο mobile, καθώς και καθαρή πλοήγηση με breadcrumbs σε όλες τις επιμέρους σελίδες ρυθμίσεων.',
                desc_en: 'Experience subtle tactile feedback when switching tabs and tapping actions on mobile, alongside clean breadcrumb navigation across all settings pages.',
                previewType: 'mobile_polish',
                caption_el: 'Φυσική αίσθηση χρήσης και ξεκάθαρος προσανατολισμός στην εφαρμογή.',
                caption_en: 'Tactile responsiveness and intuitive in-app orientation.'
            }
        ]
    },
    {
        version: '1.1.61',
        build: 73,
        date: '2026-11-20',
        title_el: 'Spendlore v1.1.61 - Βελτιστοποίηση Safe-Area & Ενημερώσεις Έκδοσης',
        title_en: 'Spendlore v1.1.61 - Safe-Area Status Bar Alignment & Release Notes Polish',
        summary_el: 'Στη νέα έκδοση 1.1.61, το Spendlore διορθώνει την ευθυγράμμιση του παραθύρου ενημερώσεων έκδοσης (What\'s New) στο Android, προσθέτοντας αυτόματη προσαρμογή safe-area για πλήρη ορατότητα κάτω από τη γραμμή κατάστασης και την κάμερα, καθώς και πλούσιες οπτικές προεπισκοπήσεις.',
        summary_en: 'In release 1.1.61, Spendlore enhances the What\'s New release drawer on Android with edge-to-edge safe-area status bar spacing, ensuring perfect visibility beneath device notches and punch-holes along with rich feature previews.',
        sections: [
            {
                title_el: 'Πλήρης Ευθυγράμμιση Safe-Area στο Android',
                title_en: 'Edge-to-Edge Safe-Area Alignment on Android',
                desc_el: 'Το συρτάρι ενημερώσεων έκδοσης (What\'s New) προσαρμόζεται πλέον αυτόματα στη status bar και το punch-hole της κάμερας σε συσκευές Android, εξασφαλίζοντας ότι ο τίτλος και το κουμπί κλεισίματος παραμένουν απόλυτα ευδιάκριτα και προσβάσιμα.',
                desc_en: 'The What\'s New release drawer now dynamically respects status bar and camera punch-hole safe areas on Android devices, guaranteeing that header titles and close actions remain completely unobstructed.',
                previewType: 'mobile_polish',
                caption_el: 'Άψογη προβολή και άνετη διάταξη σε κάθε συσκευή Android.',
                caption_en: 'Flawless layout and navigation across every Android device.'
            },
            {
                title_el: 'Εμπλουτισμένες Προεπισκοπήσεις Νέων Λειτουργιών',
                title_en: 'Rich Visual Release Previews',
                desc_el: 'Όλες οι νέες δυνατότητες του Spendlore συνοδεύονται από ρεαλιστικές οπτικές μικρογραφίες, εξαλείφοντας κενά πλαίσια και προσφέροντας άμεση κατανόηση των νέων αναβαθμίσεων.',
                desc_en: 'Every new Spendlore feature is accompanied by realistic interactive visual mockups, eliminating empty placeholder boxes and making release highlights immediate and tangible.',
                previewType: 'whats_new',
                caption_el: 'Οπτική και διαδραστική παρουσίαση των νέων δυνατοτήτων.',
                caption_en: 'Interactive and visual demonstration of upcoming improvements.'
            }
        ]
    },
    {
        version: '1.1.60',
        build: 72,
        date: '2026-11-20',
        title_el: 'Spendlore v1.1.60 - Εξελιγμένο Gaussian Blur στο Απόρρητο & Βελτιώσεις Αρχικής',
        title_en: 'Spendlore v1.1.60 - Elegant Gaussian Blur Privacy Shield & Home Polish',
        summary_el: 'Στη νέα έκδοση 1.1.60, η λειτουργία απορρήτου (Privacy Mode) αναβαθμίζεται σε ένα εξαιρετικά κομψό εφέ Gaussian blur αντί για απλούς αστερίσκους, διατηρώντας ακέραια τη δομή της οθόνης σας χωρίς ανεπιθύμητα κουνήματα.',
        summary_en: 'In release 1.1.60, Privacy Mode is elevated with a sleek Gaussian blur shield replacing rigid asterisks, preserving natural page geometry and providing a modern, private personal finance overview.',
        sections: [
            {
                title_el: 'Κομψό Gaussian Blur στη Λειτουργία Απορρήτου',
                title_en: 'Elegant Gaussian Blur Privacy Shield',
                desc_el: 'Με το πάτημα του ματιού απορρήτου, όλα τα οικονομικά ποσά, τα υπόλοιπα, οι συναλλαγές και οι τάσεις εξόδων θολώνουν ομαλά με Gaussian blur, προσφέροντας απόλυτη ιδιωτικότητα σε δημόσιους χώρους χωρίς αστερίσκους ή διατάραξη του layout.',
                desc_en: 'Tapping the privacy eye now applies an exquisite Gaussian blur to all balances, transaction amounts, and trend indicators, providing effortless shoulder-surfing protection without unsightly asterisks or layout shifts.',
                previewType: 'privacy_blur',
                caption_el: 'Απόλυτη προστασία των προσωπικών σας δεδομένων με ένα άγγιγμα.',
                caption_en: 'Uncompromised financial privacy with a single tap.'
            },
            {
                title_el: 'Ομοιόμορφη Προστασία σε Όλα τα Widgets & Φόρμες',
                title_en: 'Uniform Shielding Across All Widgets & Forms',
                desc_el: 'Ενοποίηση του εφέ θολώματος στο Safe-to-Burn, στον Κανόνα 72 Ωρών, στην κατανομή κατηγοριών και στις φόρμες συναλλαγών, εξασφαλίζοντας ενιαία και ασφαλή εμπειρία σε κάθε γωνιά της εφαρμογής.',
                desc_en: 'Unified blur shielding extended to Safe-to-Burn, 72-Hour Cooling-Off, category distributions, and entry forms for a seamless and private experience across every feature.',
                previewType: 'privacy_uniformity',
                caption_el: 'Πλήρης συνοχή και προστασία σε όλα τα στοιχεία της εφαρμογής.',
                caption_en: 'Complete consistency and privacy coverage across all components.'
            }
        ]
    },
    {
        version: '1.1.59',
        build: 71,
        date: '2026-11-20',
        title_el: 'Spendlore v1.1.59 - Ανασχεδιασμός Κατηγοριών, Κανόνες Εμπόρων & Βελτιώσεις Mobile',
        title_en: 'Spendlore v1.1.59 - Redesigned Categories, Merchant Rules & Mobile UX Polish',
        summary_el: 'Στη νέα έκδοση 1.1.59, το Spendlore αναβαθμίζει ριζικά τη διαχείριση κατηγοριών και κανόνων εμπόρων με μινιμαλιστική αισθητική Sure, διακριτικά μενού επιλογών, πλήρη απομόνωση παραθύρων διαλόγου και βελτιστοποιημένη διάταξη για οθόνες κινητών.',
        summary_en: 'In release 1.1.59, Spendlore fundamentally upgrades custom categories and merchant rules management with a minimalist Sure-inspired aesthetic, clean action menus, modal viewport isolation, and seamless mobile responsive layouts.',
        sections: [
            {
                title_el: 'Ανασχεδιασμός Προσαρμοσμένων Κατηγοριών & Κανόνων',
                title_en: 'Redesigned Custom Categories & Merchant Rules',
                desc_el: 'Νέα κομψή εμφάνιση κατηγοριών με διακριτικά χρωματικά pills, ενσωματωμένα εικονίδια Lucide, και μινιμαλιστικό μενού τριών κουκκίδων (...) για γρήγορη επεξεργασία και διαγραφή. Ενοποιημένοι κανόνες εμπόρων με δοκιμή λέξεων-κλειδιών σε πραγματικό χρόνο.',
                desc_en: 'Brand-new category design featuring pastel tint pills, semantic Lucide icons, and minimalist three-dots (...) dropdown menus for swift editing and deletion. Unified merchant rules with real-time keyword matching.',
                previewType: 'categories_redesign',
                caption_el: 'Καθαρή, μινιμαλιστική οργάνωση των κατηγοριών σας με άμεσο συγχρονισμό στο cloud.',
                caption_en: 'Clean, minimalist organization of your expense and income categories with real-time cloud sync.'
            },
            {
                title_el: 'Βελτιστοποίηση Διάταξης για Κινητά (Mobile UX)',
                title_en: 'Mobile Responsive Layout Optimization',
                desc_el: 'Πλήρως επανασχεδιασμένη εμπειρία σε οθόνες κινητών: οριζόντια κύλιση των καρτελών χωρίς σπάσιμο κειμένων, κάθετη στοίβαξη πλήρους πλάτους στα κουμπιά ενεργειών και προστασία από υπερχείλιση των μενού επιλογών.',
                desc_en: 'Fully optimized mobile experience: smooth horizontal tabs swipe with zero awkward word breaking, full-width action button stacking, and viewport overflow shielding on all dropdown menus.',
                previewType: 'mobile_polish',
                caption_el: 'Άνετη πλοήγηση και αβίαστη χρήση με το ένα χέρι σε κάθε μέγεθος οθόνης.',
                caption_en: 'Comfortable one-handed navigation and flawless rendering across all smartphone screens.'
            },
            {
                title_el: 'Απόλυτη Απομόνωση Παραθύρων Διαλόγου (Modal Isolation)',
                title_en: 'Complete Modal Viewport Isolation & Focus',
                desc_el: 'Όλα τα παράθυρα διαλόγου και οι φόρμες της εφαρμογής εμφανίζονται πλέον στο ανώτατο επίπεδο (portal στο σώμα του εγγράφου με απόλυτο z-index), κλειδώνοντας την κύλιση στο παρασκήνιο για απρόσκοπτη εστίαση.',
                desc_en: 'All application dialogs and forms now portal directly to the document body with the highest application z-index, automatically disabling background scroll for focused, distraction-free workflows.',
                previewType: 'modal_portal',
                caption_el: 'Πλήρης εστίαση και ασφαλής ακύρωση με το πλήκτρο Escape ή κλικ στο σκιασμένο παρασκήνιο.',
                caption_en: 'Complete focus trap and safe dismissal with the Escape key or backdrop click.'
            }
        ]
    },
    {
        version: '1.1.58',
        build: 70,
        date: '2026-11-20',
        title_el: 'Spendlore v1.1.58 - Διαδραστικό Γράφημα Υπολοίπου & Νέο Συρτάρι Ενημερώσεων',
        title_en: 'Spendlore v1.1.58 - Interactive Balance Trend & Editorial Release Drawer',
        summary_el: 'Με αυτή τη νέα έκδοση, το Spendlore αναβαθμίζει την κεντρική εμπειρία διαχείρισης των οικονομικών σας με διαδραστικό γράφημα εξέλιξης υπολοίπου, πλήρη επιλογέα χρονικών περιόδων, κομψό συρτάρι νέων λειτουργιών και ενιαία σήμανση Obsidian PRO.',
        summary_en: 'With this release, Spendlore elevates your personal finance experience with an interactive balance trend card inspired by Sure, multi-interval timeframe selection, an editorial release drawer, and unified obsidian PRO badging.',
        sections: [
            {
                title_el: 'Διαδραστικό Γράφημα Υπολοίπου & Τάσης Περιόδου',
                title_en: 'Interactive Balance & Net Worth Trend',
                desc_el: 'Παρακολουθήστε την πορεία του υπολοίπου σας στον χρόνο με ελαφρύ διαδραστικό γράφημα, σύγκριση τάσης σε πραγματικό χρόνο και άμεση επιλογή περιόδου (1Η, WTD, 7Η, MTD, 30Η, 90Η, YTD, 1Ε, 5Ε, Όλα) με scrubbing κύλιση ανά ημερομηνία.',
                desc_en: 'Track your net worth progression over time with a lightweight interactive area chart, real-time trend comparison, and multi-interval timeframe selector (1D, WTD, 7D, MTD, 30D, 90D, YTD, 1Y, 5Y, All) with date scrubbing.',
                previewType: 'balance_trend',
                caption_el: 'Δυναμική απεικόνιση κεφαλαίου και ταμειακών ροών στην αρχική σελίδα.',
                caption_en: 'Dynamic capital and cashflow visualization right on your home screen.'
            },
            {
                title_el: 'Παρουσίαση Νέων Δυνατοτήτων Έκδοσης (What\'s New)',
                title_en: 'Editorial \'What\'s New\' Release Drawer',
                desc_el: 'Ένα καλαίσθητο συρτάρι παρουσίασης νέων λειτουργιών που σας υποδέχεται μετά από κάθε ενημέρωση, με λεπτομερή επεξήγηση και οπτικές προεπισκοπήσεις των αλλαγών.',
                desc_en: 'An elegant release presentation drawer welcoming you upon launching new versions, offering comprehensive highlights and visual mockups of what changed.',
                previewType: 'whats_new',
                caption_el: 'Άμεση ενημέρωση για κάθε βελτίωση και νέα δυνατότητα στο Spendlore.',
                caption_en: 'Instant visibility into every improvement and enhancement in Spendlore.'
            },
            {
                title_el: 'Executive Obsidian PRO Badges',
                title_en: 'Executive Obsidian PRO Badges',
                desc_el: 'Ενιαία σήμανση PRO σε μονόχρωμο obsidian στυλ υψηλής αντίθεσης σε προφίλ, πλαϊνή μπάρα πλοήγησης και ρυθμίσεις, προσφέροντας καθαρή και επαγγελματική αισθητική.',
                desc_en: 'Unified high-contrast monochrome PRO badges across user profile cards, desktop sidebar navigation, and settings, maintaining a clean corporate aesthetic.',
                previewType: 'pro_badge',
                caption_el: 'Καθαρή μονόχρωμη σήμανση με συνεπή οπτική ιεραρχία σε φωτεινή και σκοτεινή λειτουργία.',
                caption_en: 'Clean, unboxed monochrome badge ensuring consistent visual hierarchy across light and dark modes.'
            }
        ]
    },
    {
        version: '1.1.57',
        build: 69,
        date: '2026-11-12',
        title_el: 'Spendlore v1.1.57 - Καθολική Επαναφορά Κύλισης & Βελτιστοποίηση Πλοήγησης',
        title_en: 'Spendlore v1.1.57 - Global Scroll Preservation & Navigation Polish',
        summary_el: 'Αυτόματη επαναφορά κύλισης στην αρχή της σελίδας σε κάθε μετάβαση και προβολή, εξασφαλίζοντας ομαλή πλοήγηση σε καρτέλες, ρυθμίσεις και προφίλ χρηστών.',
        summary_en: 'Global scroll position reset across all screen transitions and views, eliminating stuck scroll offsets when switching tabs or viewing account profiles.',
        sections: [
            {
                title_el: 'Άμεση Επαναφορά Κύλισης σε Κάθε Μετάβαση',
                title_en: 'Instant Scroll Reset on Screen Transitions',
                desc_el: 'Κάθε φορά που ανοίγετε ένα προφίλ χρήστη, αλλάζετε ενότητα στις ρυθμίσεις ή περιηγείστε στο app, η σελίδα ξεκινά πάντα από την αρχή χωρίς να διατηρεί προηγούμενη κύλιση.',
                desc_en: 'Every time you view a user profile, change settings sections, or navigate between tabs, the viewport immediately resets to top without retained scroll offset.',
                previewType: 'scroll_reset',
                caption_el: 'Απρόσκοπτη περιήγηση με συνεπή συμπεριφορά κύλισης σε κινητό και υπολογιστή.',
                caption_en: 'Seamless viewport navigation with consistent top scroll behavior across devices.'
            }
        ]
    },
    {
        version: '1.1.56',
        build: 68,
        date: '2026-11-11',
        title_el: 'Spendlore v1.1.56 - Διαχείριση Ενημερώσεων & Εκκαθάριση Cache',
        title_en: 'Spendlore v1.1.56 - In-App Updates & Cache Management',
        summary_el: 'Προσθήκη αποκλειστικών ρυθμίσεων για άμεσο έλεγχο ενημερώσεων μέσω Google Play και ασφαλή εκκαθάριση τοπικής cache απευθείας από την ενότητα Σύστημα & Εφαρμογή.',
        summary_en: 'Dedicated controls for checking app updates directly via Google Play and safely purging local cache directly from the System & App section.',
        sections: [
            {
                title_el: 'Έλεγχος Ενημερώσεων & Εκκαθάριση Μνήμης',
                title_en: 'Update Verification & Safe Cache Reset',
                desc_el: 'Εύκολος έλεγχος διαθεσιμότητας νέων εκδόσεων και δυνατότητα επαναφοράς της τοπικής cache σε περίπτωση που δεν φορτώνει άμεσα η τελευταία έκδοση.',
                desc_en: 'Effortlessly check for new versions on Google Play and reset local cache whenever a newer release needs immediate loading.',
                previewType: 'update_check',
                caption_el: 'Πλήρης έλεγχος εκδόσεων και κατάστασης εφαρμογής από το προφίλ.',
                caption_en: 'Complete version control and application maintenance from user profile.'
            }
        ]
    }
];

export const getLatestReleaseNote = () => RELEASE_NOTES[0] || null;

export const getReleaseNoteByVersion = (version) => {
    if (!version) return null;
    return RELEASE_NOTES.find(n => n.version === String(version).trim()) || null;
};

export const getAllReleaseNotes = () => RELEASE_NOTES;

export default {
    RELEASE_NOTES,
    getLatestReleaseNote,
    getReleaseNoteByVersion,
    getAllReleaseNotes,
};
