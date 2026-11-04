# Personal Bio-Data & Portfolio Website

A modern, responsive, and fully customizable **Personal Bio-Data & Portfolio Website** built with pure HTML5, Tailwind CSS, and Vanilla JavaScript.

This website allows you to showcase and easily customize:
- **Personal Bio-Data & Profile** (Full Name, Date of Birth, Blood Group, Marital Status, Languages, Hobbies)
- **Education & Academics** (10th Standard, 12th Standard, Graduation Degree, Institutions, Boards/Universities, Marks/CGPA)
- **Verified Certificates & Credentials** (Courses, Certifications, Issuing Organizations, Certificate Photos, Credential IDs)
- **Family Background & Residence** (Parents' names and occupations, Siblings, Native permanent address, Current residential city)
- **Technical & Soft Skills** (Proficiency progress bars)
- **Direct Contact & WhatsApp CTA**

Everything can be customized on-the-fly directly inside your browser!

---

## 🚀 Key Features

1. **⚙️ In-Built Live Customizer & Editor Modal**:
   - Click the **"Customize"** button (top navbar or bottom-right floating pill) to open the Live Editor.
   - Edit any field effortlessly without touching any code.
   - All changes are automatically persisted to your browser's **LocalStorage** (they remain saved even after page refresh or browser restart).

2. **📸 Interactive Photo Cropper & Adjuster**:
   - Selecting or uploading a profile photo automatically launches an **Interactive Circular Cropper window**.
   - Drag to pan, scroll or pinch to zoom in/out, rotate 90°, and fit your face cleanly into the circular profile frame.
   - Clicking **"Crop & Apply Profile Photo"** crops and compresses the photo instantly.
   - Use the **"Adjust & Crop"** button inside the Customizer anytime to re-center or adjust your existing photo.

3. **⚡ Smart Automatic Image Compression**:
   - Uploading high-resolution camera photos (5MB - 15MB) is automatically compressed via an off-screen HTML5 `<canvas>` to ~40KB-60KB without visible quality loss.
   - Completely eliminates browser LocalStorage quota errors.

4. **✉️ Interactive Contact Form & Built-In Messages Inbox**:
   - Visitors can enter their Name, Email, Phone, Inquiry Subject (Job Opportunity, Collaboration, Verification, etc.), and Message.
   - **Send Message**: Stores inquiries directly in your browser's local Inbox and prepares an email dispatch.
   - **Send to WhatsApp**: One-click formatted WhatsApp dispatch pre-filling the message directly to your phone number.
   - **Built-in Inbox Tab**: Inside the **Customize** modal, view all received messages with timestamps, sender information, and one-click Reply via Email or WhatsApp.

5. **📜 Certificate Image Viewer & Credential Showcase**:
   - Attach photos or online links for each certificate.
   - Clicking on any certificate opens a clean, full-screen lightbox preview modal.

5. **🖨️ One-Click Printable Bio-Data / PDF Export**:
   - Click **"Print / Download Bio-Data (PDF)"** to open your browser's native print dialog.
   - Built-in print stylesheets automatically hide navigation bars, buttons, and edit controls, outputting a clean A4 document ready for job submissions or matrimonial bio-data printing.

6. **💾 JSON Backup & Restore**:
   - **Backup / JSON** tab allows you to download your entire customized bio-data as a `.json` file.
   - Import your backup file on any other device or browser to restore your profile in seconds.

7. **🌌 Modern Dark Theme & Smooth Animations**:
   - **Deep Obsidian Background (`#080c16`)**: Default dark mode with an ambient mesh grid pattern.
   - **Floating Ambient Glow Orbs**: Subtle indigo, purple, and pink blurred orbs floating smoothly in the background.
   - **Rotating Conic Avatar Aura**: Profile photo is framed in an animated rotating multi-color aura ring.
   - **Shimmering Gradient Headline**: Dynamic light-sweeping gradient text for your profile name.
   - **Scroll-Reveal Animations**: Sections and cards smoothly glide up and fade in as you scroll down the page.
   - **Animated Skill Progress Bars**: Technical skill bars smoothly expand with a continuous light shimmer wave.
   - **Light / Dark Mode Toggle**: Easily switch back to light mode anytime with the moon/sun icon in the navbar.

8. **📱 Fully Responsive Design**:
   - Optimized for mobile phones, tablets, laptops, and ultra-wide desktop monitors.

---

## 💻 How to Run

### Method 1: Open Directly in Your Browser (No Setup Required)
- Navigate to the folder: `/Users/ramvijayprajapati/Downloads/vij_bio`
- Double-click `index.html` to open it in Google Chrome, Safari, Microsoft Edge, or Firefox.

### Method 2: Local HTTP Server (Optional)
If you prefer running a local server:
```bash
python3 -m http.server 8000
```
Then visit in your browser: `http://localhost:8000`

---

## 🌐 Free Online Hosting Options

You can host this website online for free so anyone in the world can view your profile:

### 1. GitHub Pages (Free):
1. Create a new repository on [GitHub](https://github.com) (e.g., `my-biodata`).
2. Upload the files (`index.html`, `style.css`, `app.js`, `data.js`) to the repository.
3. Go to **Repository Settings -> Pages**, select the `main` branch, and click **Save**.
4. Your website will be live at `https://<your-username>.github.io/my-biodata/`!

### 2. Netlify Drop (Instant & Free):
1. Visit [app.netlify.com/drop](https://app.netlify.com/drop).
2. Drag and drop this folder onto the page.
3. Within seconds, you will receive a free public URL (e.g., `https://ramvijay-bio.netlify.app`).

---

## 📂 Project Structure
- `index.html` - Semantic HTML5 layout, accessible navigation, and modal structures.
- `style.css` - Custom styling, circular cropper mask, glassmorphism, and print stylesheet.
- `data.js` - Default English profile template data.
- `app.js` - Dynamic DOM rendering, Cropper.js integration, canvas compression, LocalStorage persistence, and JSON backup logic.
- `README.md` - Documentation and setup guide.
