# CV Template with Export & Translation Functionality

A modern, professional CV template built with React, TypeScript, and Tailwind CSS. This application allows you to create, customize, translate, and export a beautiful CV in PDF format.

---

## Features
- 🎨 **Modern Design**: Clean, professional layout with beautiful typography  
- 📱 **Responsive**: Optimized for both screen viewing and printing  
- 📄 **PDF Export**: High-quality PDF generation with proper pagination  
- 🌐 **French & Translations**: Designed for French CVs and now supports translation via Google Gemini API  
- ⚡ **Fast Performance**: Built with Vite for lightning-fast development  
- 🎯 **TypeScript**: Full type safety for better development experience  
- 🎨 **Tailwind CSS**: Utility-first CSS framework for easy customization  

---

## CV Sections
The template includes all standard French CV sections:  

- **Header**: Personal information with contact details  
- **Profil Professionnel**: Professional summary/profile  
- **Domaines de Compétences**: Skills and competencies  
- **Environnements Techniques**: Technical skills and technologies  
- **Expériences Professionnelles**: Professional experience with detailed missions  
- **Langues**: Languages with proficiency levels  
- **Certifications**: Professional certifications and training  

---

## Technologies Used
- **React 18**: Modern React with hooks  
- **TypeScript**: Type-safe JavaScript  
- **Tailwind CSS**: Utility-first CSS framework  
- **Vite**: Fast build tool and development server  
- **Lucide React**: Beautiful icons  
- **React-to-Print**: PDF export functionality  
- **Google Gemini API**: AI-powered translation of CV content  

---

## Prerequisites
Before running this application, make sure you have the following installed:  

- Node.js (version 16 or higher)  
- npm or yarn package manager  

---

## Installation
Clone the repository (or download the source code):

```bash
git clone <repository-url>
cd french-cv-template
```

Install dependencies:

```bash
npm install
```

---

## Configuring the Gemini Translation API
1. **Create a `.env` file** in the project root:

```bash
touch .env
```

2. **Add your environment variables**:

```env
GEMINI_API_KEY=your_google_gemini_api_key
PORT=4000
CLIENT_ORIGIN=http://localhost:5173
```

- **GEMINI_API_KEY**: Your API key for the Google Gemini API  
- **PORT**: Port for the translation server (default: 4000)  
- **CLIENT_ORIGIN**: The frontend origin for CORS (default: `http://localhost:5173`)  

3. **Obtain your API key** from Google: [Google Gemini API Key Documentation](https://ai.google.dev/gemini-api/docs/api-key)  

---

## Running the Application

### Development Mode
Start the development server:

To start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

### Translation Server
The translation server runs on the port specified in `.env` (default 4000). It provides endpoints to translate your CV content using the Gemini API.  

- Test translation route:

```
POST http://localhost:4000/api/translate
Body: {
  "targetLang": "English",
  "data": { ...CV_DATA }
}
```

---

### Build for Production
```bash
npm run build
```
The built files will be in the `dist` directory.

### Preview Production Build
The application will be available at `http://localhost:5173`

### Build for Production

To build the application for production:

```bash
npm run build
```

The built files will be in the `dist` directory.

### Preview Production Build

To preview the production build locally:

```bash
npm run preview
```

---

## Customizing Your CV
1. **Update Personal Information**  
Edit `src/data/cvData.ts` to customize your CV content:

```ts
export const CV_DATA: CVData = {
  personalInfo: {
    fullName: "Your Name",
    professionalTitle: "Your Title",
    avatarUrl: "your-photo-url"
  },
  // ... other sections
};
```

2. **Modify Sections**  
You can add, remove, or modify any section by updating the `cvData.ts` file.  

3. **Styling Customization**  
- Modify Tailwind classes in components  
- Update `tailwind.config.js`  
- Add custom CSS in `src/index.css`  

---

## Exporting Your CV
- **PDF Export**: Click the "PDF" button in the top-right corner  
- **Print**: CV optimized for A4 printing with proper page breaks  

---

## Project Structure
```
src/
├── components/
│   ├── CVTemplate.tsx          # Main CV template component
│   └── PrintableCVContent.tsx  # Printable CV content
├── data/
│   └── cvData.ts              # CV data configuration
├── types/
│   └── cv.ts                  # TypeScript type definitions
├── App.tsx                    # Main application component
├── main.tsx                   # Application entry point
└── index.css                  # Global styles
```

---

## Key Components
- **CVTemplate**: Main component for layout and export functionality  
- **PrintableCVContent**: Optimized for printing and PDF generation  
- **CV_DATA**: Configuration object containing all CV information  

---

## Browser Compatibility
- Chrome (recommended for PDF export)  
- Firefox  
- Safari  
- Edge  

---

## Contributing
- Fork the repository  
- Create a feature branch  
- Make your changes  
- Test thoroughly  
- Submit a pull request  

---

## License
This project is open source and available under the MIT License.  

---

## Support
- Check the browser console for errors  
- Ensure dependencies are installed  
- Verify Node.js version  
- Confirm `cvData.ts` follows TypeScript interfaces  

---

## Future Enhancements
- Multiple CV templates  
- Real-time editing interface  
- Multiple language support  
- Cloud storage integration  
- Additional export formats (Word, etc.)  

---

**Happy job hunting! 🚀**
