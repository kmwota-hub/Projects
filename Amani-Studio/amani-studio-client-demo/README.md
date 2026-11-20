# Amani Studio — client pitch website demo

A responsive, static HTML/CSS/JavaScript website concept for pitching a salon or beauty business. It is deliberately built without a database or server.

## Run locally
1. Extract the ZIP.
2. Open `index.html` in a browser, or use VS Code Live Server.
3. Test the navigation, service enquiry links and booking form.

## Before showing it to a real business
Edit `config.js`:
- `name`: business name
- `whatsapp`: real WhatsApp number with country code, digits only (Kenya example: `2547XXXXXXXX`)
- `phoneDisplay`: number displayed on the page
- `location`: exact location
- `hours`: confirmed opening hours
- `googleMapsUrl`: exact Google Maps directions/share URL

Replace the sample Unsplash photos with the client's own approved work and update the service list, descriptions, prices (if confirmed), and contact details. The Amani Studio identity is fictional and is only a demonstration brand.

## Booking flow
The booking form validates the required fields and opens WhatsApp with a pre-filled appointment request. The visitor still presses Send in WhatsApp, and the business confirms availability manually. No booking is stored in a database and no automatic confirmation is sent.

## Deployment
This is a static site and can be deployed on Netlify, Vercel or Cloudflare Pages:
- Upload the extracted project folder, or connect its Git repository.
- No build command is required.
- Set the publish/output directory to the project root.
- Connect the client's domain after deployment.

## Important production checks
- Use real client-approved images and copy.
- Confirm every phone number, location, map pin, service and opening hour.
- Test WhatsApp on both Android and iPhone.
- Add a privacy notice if collecting personal information or adding analytics.
- Confirm image licensing and replace remote sample images where appropriate.
- Domain registration, renewals, professional photography, copywriting and future changes should be quoted separately.

## Suggested client pitch
"I put together a sample of how your business could look online. Customers can view your services on their phones and send an appointment request straight to your WhatsApp. If you like the direction, I can personalise it with your real photos, services, location and contact details."
