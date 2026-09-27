diff --git a/ANALYTICS.md b/ANALYTICS.md
index d3f42b9..7634fa1 100644
--- a/ANALYTICS.md
+++ b/ANALYTICS.md
@@ -125,7 +125,7 @@ assessment answers are ever sent.
 ### GTM and GA4 setup (to do in the container UI; not yet configured)
 
 About 10 minutes. Mirrors the existing "GA4 - assessment funnel events"
-setup: same GA4 property (`G-33HFQC8STP`), same consent handling. The events
+setup: same GA4 property (`G-5B9Q2WHCNL`), same consent handling. The events
 only fire on the live site once the deploy containing #99 is live.
 
 **1. Variables** (Variables → User-Defined Variables → New → Data Layer Variable, Version 2)
@@ -149,13 +149,12 @@ if one exists. Confirm the built-in **Event** variable is enabled
 **3. Tag** (Tags → New → Google Analytics: GA4 Event)
 
 - Name: `GA4 - commercial journey events`
-- Measurement ID: `G-33HFQC8STP`, or the existing Google tag, matching the
+- Measurement ID: `G-5B9Q2WHCNL`, or the existing Google tag, matching the
   lead-event tag.
 - Event Name: `{{Event}}`
 - Event Parameters: `offer` = `{{DLV - offer}}`, `pillar` = `{{DLV - pillar}}`,
   `source_page` = `{{DLV - source_page}}`
-- Consent Settings: as the lead-event tag (GA4 tags have built-in consent
-  checks; the site already passes the cookie choice to GTM).
+- Consent: same as `GA4 - gate + preview events` (built-in checks, additional consent "Not set").
 - Triggering: `CE - commercial journey`
 
 **4. Test in Preview** on `https://ecm.dev`, after accepting cookies:
@@ -168,7 +167,7 @@ if one exists. Confirm the built-in **Event** variable is enabled
 Each time, "GA4 - commercial journey events" should appear under Tags Fired
 with all three parameters filled.
 
-**5. Publish** as `Version 10: commercial journey events`.
+**5. Publish.** Went live as container version 15.
 
 **6. GA4 custom dimensions** (Admin → Data display → Custom definitions →
 Create custom dimension, scope Event): `Offer` from `offer`, `Pillar` from
