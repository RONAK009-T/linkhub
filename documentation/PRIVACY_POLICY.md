# Privacy Policy – LinkHub Platform

*Last Updated: November 2026*  
*Compliant with the Digital Personal Data Protection Act, 2023 (DPDPA), Information Technology Act, 2000, and Google Play Data Safety Requirements.*

---

## 1. Overview & Data Fiduciary Commitment

LinkHub ("we", "our", or "the Platform") operates an ephemeral social chat, online gaming, and curated directory platform. As a Data Fiduciary under the Digital Personal Data Protection Act, 2023 (DPDPA), we are committed to processing digital personal data only for specified, lawful purposes based on your explicit and informed consent or legitimate statutory grounds.

---

## 2. Personal Data We Collect

We collect only the minimal data strictly necessary for providing our services:

1. **Account Data**:
   - Username and Display Name
   - Email address
   - Password (stored strictly using salted one-way `bcrypt` hashes; plaintext passwords are never stored)
   - Profile photo URL (optional)
   - Bio (optional)

2. **Google OAuth Account Data**:
   - If you choose Google Sign-In, we receive your Google verified email, public display name, and avatar image from Google OAuth. We never access your Google contacts, Google Drive, or Google passwords.

3. **Ephemeral Temporary Chat Messages**:
   - Text messages sent through the temporary chat system.
   - **Crucial Notice**: Every message is programmed with a strict server-side **60-second expiration timestamp**. Upon expiration, messages are permanently purged from database tables by an automated server cleanup daemon. Expired messages are not archived in active backups accessible to staff or users.
   - **Screenshot & External Recording Advisory**: While LinkHub purges messages from servers after 60 seconds, recipients may take device screenshots or photograph displays. Users should not share sensitive private information in temporary chats.

4. **Preferences & Analytics (With Consent)**:
   - Bookmarked / Favorited website links.
   - Device theme preferences.
   - Pseudonymous analytics telemetry if you have explicitly granted opt-in consent.

---

## 3. Purpose of Processing

Your personal data is processed solely for:
- Authenticating your identity and maintaining session security.
- Facilitating real-time delivery of temporary messages to intended recipients.
- Enabling you to save bookmarks and discover curated resources.
- Detecting, preventing, and moderating abusive behavior, spam, or copyright violations.

---

## 4. Rights of the Data Principal (Under DPDPA 2023)

As a Data Principal under Indian law, you have the right to:
1. **Right to Access & Information**: Request a summary of your personal data processed by LinkHub.
2. **Right to Correction & Erasure**: Correct inaccurate data or delete your account and associated personal data at any time via Profile > Delete Account.
3. **Right to Grievance Redressal**: File a complaint with our designated Grievance Officer regarding any data processing concern.
4. **Right to Nominate**: Nominate an individual to exercise your rights in the event of death or incapacity.

---

## 5. Security & Data Protection Measures

- **Encryption in Transit**: All API requests and WebSocket sessions utilize Transport Layer Security (TLS / HTTPS).
- **Access Controls**: Role-based access control restricts administrative features to verified staff.
- **SQL Injection & XSS Protection**: Parameterized SQL queries and security headers (Helmet) prevent unauthorized code execution.
- **Automated Message Purge**: Server-side cleanup job runs every 2 seconds to hard-delete expired temporary chats.

---

## 6. Grievance Officer Contact Details

In compliance with the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules and DPDPA 2023:

- **Designation**: Grievance Redressal Officer
- **Organization**: LinkHub Technologies
- **Email**: grievance@linkhub.com
- **Statutory Acknowledgement Window**: Within 24 hours of ticket receipt
- **Statutory Resolution Window**: Within 15 calendar days
- **Online Grievance Submission**: Available in-app via the Grievance Redressal Form.
