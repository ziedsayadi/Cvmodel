<<<<<<< HEAD
import { Save, RotateCcw, Eye, Edit, Plus, Trash2, Layers } from "lucide-react";
import type { CVData, TechnologyCategory, Experience, CustomSection } from "../types/cv";
import PrintableCVContent from "./PrintableCVContent";
import { useState, useEffect } from 'react';
import { createCustomSection } from '../utils/cvHelpers';
import { useLanguage } from '../contexts/LanguageContext';

export interface CVEditorProps {
  data: CVData;
  onUpdate: (data: CVData) => void;
  onSave: () => void;
  onReset: () => void;
  onTogglePreview: () => void;
  isPreviewMode: boolean;
}

const CVEditor: React.FC<CVEditorProps> = ({
  data,
  onUpdate,
  onSave,
  onReset,
  onTogglePreview,
  isPreviewMode,
}) => {
  const [activeSection, setActiveSection] = useState<string>("personal");
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(data.personalInfo.avatarUrl || null);
  const { t } = useLanguage();

  // Effect to update preview URL if data.personalInfo.avatarUrl changes
  useEffect(() => {
    setImagePreviewUrl(data.personalInfo.avatarUrl || null);
  }, [data.personalInfo.avatarUrl]);

  // ---------------------------------------
  // UPDATE HELPERS
  // ---------------------------------------

  const updateField = (path: string[], value: string) => {
    const newData = { ...data };
    let current: any = newData;

    for (let i = 0; i < path.length - 1; i++) {
      current = current[path[i]];
    }

    current[path[path.length - 1]] = value;
    onUpdate(newData);
  };

  // Helper to update a specific field in an array of objects
  const updateArrayField = (
    section: keyof CVData,
    index: number,
    field: string,
    value: string
  ) => {
    const newData = { ...data };
    const array = newData[section] as any[];
    // Ensure the item at the index exists and is an object before updating
    if (array && array[index] && typeof array[index] === 'object') {
      array[index] = { ...array[index], [field]: value };
    } else if (section === 'skills' && typeof array[index] === 'string') {
      // Special handling for skills which are strings
      array[index] = value;
    }
    onUpdate(newData);
  };

  // ---------------------------------------
  // ITEMS ADD/REMOVE
  // ---------------------------------------

  const addExperience = () => {
    const newExp: Experience = {
      id: Date.now().toString(),
      jobTitle: "",
      company: "",
      missions: [""],
    };
    onUpdate({ ...data, experiences: [...data.experiences, newExp] });
  };

  const removeExperience = (index: number) => {
    onUpdate({
      ...data,
      experiences: data.experiences.filter((_, i) => i !== index),
    });
  };

  const addMission = (expIndex: number) => {
    const newData = { ...data };
    newData.experiences[expIndex].missions.push("");
    onUpdate(newData);
  };

  const removeMission = (expIndex: number, missionIndex: number) => {
    const newData = { ...data };
    newData.experiences[expIndex].missions = newData.experiences[
      expIndex
    ].missions.filter((_, i) => i !== missionIndex);
    onUpdate(newData);
  };

  const updateMission = (
    expIndex: number,
    missionIndex: number,
    value: string
  ) => {
    const newData = { ...data };
    newData.experiences[expIndex].missions[missionIndex] = value;
    onUpdate(newData);
  };

  const addLanguage = () => {
    onUpdate({
      ...data,
      languages: [...data.languages, { name: "", flag: "", level: "" }],
    });
  };

  const removeLanguage = (index: number) => {
    onUpdate({
      ...data,
      languages: data.languages.filter((_, i) => i !== index),
    });
  };

  const addCertification = () => {
    onUpdate({
      ...data,
      certifications: [...data.certifications, { name: "", issuer: "" }],
    });
  };

  const removeCertification = (index: number) => {
    onUpdate({
      ...data,
      certifications: data.certifications.filter((_, i) => i !== index),
    });
  };

  const addSkill = () => {
    onUpdate({ ...data, skills: [...data.skills, ""] });
  };

  const removeSkill = (index: number) => {
    onUpdate({
      ...data,
      skills: data.skills.filter((_, i) => i !== index),
    });
  };

  const updateSkill = (index: number, value: string) => {
    const newData = { ...data };
    newData.skills[index] = value;
    onUpdate(newData);
  };

  // --- Technologies Section Handlers ---

  const addTechnologyCategory = () => {
    const newCategory: TechnologyCategory = { id: Date.now().toString(), title: "", items: "" };
    onUpdate({ ...data, technologies: [...data.technologies, newCategory] });
  };

  const removeTechnologyCategory = (index: number) => {
    onUpdate({
      ...data,
      technologies: data.technologies.filter((_, i) => i !== index),
    });
  };

  const updateTechnologyTitle = (index: number, title: string) => {
    const newData = { ...data };
    newData.technologies[index].title = title;
    onUpdate(newData);
  };

  const updateTechnologyItems = (index: number, items: string) => {
    const newData = { ...data };
    newData.technologies[index].items = items;
    onUpdate(newData);
  };

  // --- Custom Section Handlers ---
  const addCustomSection = () => {
    const newSection = createCustomSection("Nouvelle Section", "");
    const newData = { ...data };
    newData.customSections.push(newSection);
    newData.sectionOrder.push(newSection.id);
    onUpdate(newData);
    setActiveSection(newSection.id);
  };

  const removeCustomSection = (id: string) => {
    const newData = { ...data };
    newData.customSections = newData.customSections.filter(s => s.id !== id);
    newData.sectionOrder = newData.sectionOrder.filter(sid => sid !== id);
    onUpdate(newData);
    if (activeSection === id) {
      setActiveSection("personal");
    }
  };

  const updateCustomSectionTitle = (id: string, title: string) => {
    const newData = { ...data };
    const section = newData.customSections.find(s => s.id === id);
    if (section) section.title = title;
    onUpdate(newData);
  };

  const updateCustomSectionSubtitle = (id: string, subtitle: string) => {
    const newData = { ...data };
    const section = newData.customSections.find(s => s.id === id);
    if (section) section.subtitle = subtitle;
    onUpdate(newData);
  };

  const addCustomSectionBlock = (id: string) => {
    const newData = { ...data };
    const section = newData.customSections.find(s => s.id === id);
    if (section) section.blocks.push("");
    onUpdate(newData);
  };

  const removeCustomSectionBlock = (id: string, blockIndex: number) => {
    const newData = { ...data };
    const section = newData.customSections.find(s => s.id === id);
    if (section) section.blocks = section.blocks.filter((_, i) => i !== blockIndex);
    onUpdate(newData);
  };

  const updateCustomSectionBlock = (id: string, blockIndex: number, value: string) => {
    const newData = { ...data };
    const section = newData.customSections.find(s => s.id === id);
    if (section) section.blocks[blockIndex] = value;
    onUpdate(newData);
  };

  // --- Image Upload Handlers ---
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (5MB limit)
      const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSizeInBytes) {
        alert("Le fichier dépasse la limite de 5 Mo.");
        event.target.value = ""; // Clear the input
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const newAvatarUrl = reader.result as string;
        updateField(["personalInfo", "avatarUrl"], newAvatarUrl);
        setImagePreviewUrl(newAvatarUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    updateField(["personalInfo", "avatarUrl"], "");
    setImagePreviewUrl(null);
    // Clear the file input if it exists
    const fileInput = document.getElementById('avatarInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  // ---------------------------------------
  // SECTIONS LIST
  // ---------------------------------------

  const sections = [
    { id: "personal", label: t('personalInfo'), icon: "👤" },
    { id: "profile", label: t('profile'), icon: "📝" },
    { id: "contact", label: t('contact'), icon: "📧" },
    { id: "skills", label: t('skills'), icon: "⚡" },
    { id: "technologies", label: t('technologies'), icon: "💻" },
    { id: "experiences", label: t('experiences'), icon: "💼" },
    { id: "languages", label: t('languages'), icon: "🌐" },
    { id: "certifications", label: t('certifications'), icon: "🏆" },
    ...data.customSections.map(section => ({
      id: section.id,
      label: section.title || t('customSection'),
      icon: "📑"
    }))
  ];

  // ---------------------------------------
  // RETURN UI
  // ---------------------------------------

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* HEADER */}
      <div className="bg-gray-800 text-white p-4 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-3">
          <Edit size={24} />
          <h2 className="text-xl font-bold">{t('editor')}</h2>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onTogglePreview}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            {isPreviewMode ? <Edit size={18} /> : <Eye size={18} />}
            {isPreviewMode ? t('edit') : t('preview')}
          </button>

          <button
            onClick={onReset}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <RotateCcw size={18} />
            {t('reset')}
          </button>

          <button
            onClick={onSave}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
          >
            <Save size={18} />
            {t('save')}
          </button>
        </div>
      </div>

      {/* MAIN SPLIT VIEW - Responsive: stacked on mobile (<lg), side-by-side on desktop (>=lg) */}
      <div className="flex flex-1 overflow-hidden flex-col lg:flex-row">

        {/* LEFT SIDE — EDITOR */}
        <div className="w-full lg:w-2/4 overflow-y-auto p-4 lg:p-8 border-b lg:border-b-0 lg:border-r border-gray-200">
          <div className="w-full max-w-[650px] mx-auto space-y-6">

            <div className="flex flex-1 overflow-hidden">
                <div className="bg-gray-50 border-r border-gray-200 w-full">
                  <nav className="p-4 flex gap-2 overflow-x-auto whitespace-nowrap flex-wrap">
                    {sections.map((section) => (
                      <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={`inline-flex items-center gap-3 min-w-[140px] text-left px-4 py-3 rounded-lg transition-colors ${
                          activeSection === section.id
                            ? 'bg-blue-600 text-white'
                            : 'hover:bg-gray-200 text-gray-700'
                        }`}
                      >
                        <span className="text-xl">{section.icon}</span>
                        <span className="font-medium">{section.label}</span>
                      </button>
                    ))}
                    <button
                      onClick={addCustomSection}
                      className="inline-flex items-center gap-2 min-w-[140px] text-left px-4 py-3 rounded-lg transition-colors border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50 text-gray-600 hover:text-blue-600"
                    >
                      <Plus size={18} />
                      <span className="font-medium">Section Personnalisée</span>
                    </button>
                  </nav>
                </div>
            </div>

            {/* -------------------- PERSONAL -------------------- */}
            {activeSection === "personal" && (
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-gray-800 mb-6">
                  Informations Personnelles
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom Complet
                  </label>
                  <input
                    type="text"
                    value={data.personalInfo.fullName}
                    onChange={(e) =>
                      updateField(["personalInfo", "fullName"], e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Titre Professionnel
                  </label>
                  <input
                    type="text"
                    value={data.personalInfo.professionalTitle}
                    onChange={(e) =>
                      updateField(
                        ["personalInfo", "professionalTitle"],
                        e.target.value
                      )
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Image Upload Section */}
                
                <div className="mt-4 border-2 border-gray-400 rounded-lg p-8">

                 
                  {!imagePreviewUrl && (
                   <button
                    onClick={() => document.getElementById('avatarInput')?.click()}
                    className="flex justify-center items-center mx-auto my-1 gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 rounded-lg text-white font-medium transition"
                    >
                      
                      <span className="text-2xl">📸</span> 
                      Importer votre image portfeuil
                    </button>
                  )}

                  {/* Hidden Input used for selecting file */}

                  <div className="flex justify-between items-center">                   

                  {/* ✅ If image exists → show preview */}
                  {imagePreviewUrl && (
                    <div className="flex items-center gap-4 mt-6">

                      <div className="relative w-24 h-24 rounded-full border-2 border-gray-100 overflow-visible">
                        <img
                          src={imagePreviewUrl}
                          alt="Aperçu de la photo"
                          className="w-full h-full rounded-full object-cover"
                        />

                        {/* Delete button */}
                        <button
                          onClick={handleRemoveImage}
                          className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 shadow-lg hover:bg-red-700"
                          aria-label="Supprimer la photo"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                    </div>
                  )}
                  <div>
                   <input id="avatarInput" 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageChange} 
                    className=
                    {`${!imagePreviewUrl ? 'hidden' : 'block pointer text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-600'}`}
                   />
                   {imagePreviewUrl && (
                     <p className="text-xs text-gray-500 mt-1"> Max 5 Mo. Formats acceptés : JPG, PNG, GIF. </p>
                   )}
                   </div>
                  </div>

                </div>

              </div>
            )}

            {/* PROFILE */}
            {activeSection === "profile" && (
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-gray-800 mb-6">
                  Profil Professionnel
                </h3>

                <textarea
                  value={data.profile}
                  onChange={(e) => updateField(["profile"], e.target.value)}
                  rows={8}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}

            {/* CONTACT */}
            {activeSection === "contact" && (
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-gray-800 mb-6">
                  Contact
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={data.contact.email}
                    onChange={(e) =>
                      updateField(["contact", "email"], e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    value={data.contact.phone}
                    onChange={(e) =>
                      updateField(["contact", "phone"], e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Localisation
                  </label>
                  <input
                    type="text"
                    value={data.contact.location}
                    onChange={(e) =>
                      updateField(["contact", "location"], e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    GitHub
                  </label>
                  <input
                    type="text"
                    value={data.contact.github}
                    onChange={(e) =>
                      updateField(["contact", "github"], e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    LinkedIn
                  </label>
                  <input
                    type="text"
                    value={data.contact.linkedin}
                    onChange={(e) =>
                      updateField(["contact", "linkedin"], e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            )}

            {/* SKILLS */}
            {activeSection === "skills" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-800">
                    Domaines de Compétences
                  </h3>
                  <button
                    onClick={addSkill}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Plus size={18} />
                    Ajouter
                  </button>
                </div>

                {data.skills.map((skill, index) => (
                  <div key={index} className="flex gap-2">
                    <textarea
                      value={skill}
                      onChange={(e) => updateSkill(index, e.target.value)}
                      rows={2}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Compétence"
                    />
                    <button
                      onClick={() => removeSkill(index)}
                      className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* TECHNOLOGIES */}
            {activeSection === "technologies" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-800">
                    Environnements Techniques
                  </h3>
                  <button
                    onClick={addTechnologyCategory}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Plus size={18} />
                    Ajouter Catégorie
                  </button>
                </div>

                {data.technologies.map((techCategory, index) => (
                  <div
                    key={index}
                    className="border border-gray-300 rounded-lg p-4 bg-gray-50 space-y-4"
                  >
                    <div className="flex justify-between items-center">
                      <input
                        type="text"
                        value={techCategory.title}
                        onChange={(e) =>
                          updateTechnologyTitle(index, e.target.value)
                        }
                        className="text-lg font-semibold text-gray-800 px-2 py-1 border border-gray-300 rounded-lg flex-1"
                        placeholder="Titre de la catégorie"
                      />
                      <button
                        onClick={() => removeTechnologyCategory(index)}
                        className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 ml-3"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Éléments (séparés par des virgules)
                      </label>
                      <textarea
                        value={techCategory.items}
                        onChange={(e) =>
                          updateTechnologyItems(index, e.target.value)
                        }
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Ex: PHP 7, JavaScript, TypeScript"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* EXPERIENCES */}
            {activeSection === "experiences" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-800">
                    Expériences Professionnelles
                  </h3>
                  <button
                    onClick={addExperience}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Plus size={18} />
                    Ajouter
                  </button>
                </div>

                {data.experiences.map((exp, expIndex) => (
                  <div
                    key={exp.id}
                    className="border border-gray-300 rounded-lg p-6 space-y-4 bg-gray-50"
                  >
                    <div className="flex justify-between items-start">
                      <h4 className="text-lg font-bold text-gray-800">
                        Expérience {expIndex + 1}
                      </h4>
                      <button
                        onClick={() => removeExperience(expIndex)}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Titre du Poste
                      </label>
                      <input
                        type="text"
                        value={exp.jobTitle}
                        onChange={(e) =>
                          updateArrayField(
                            "experiences",
                            expIndex,
                            "jobTitle",
                            e.target.value
                          )
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Entreprise
                      </label>
                      <input
                        type="text"
                        value={exp.company}
                        onChange={(e) =>
                          updateArrayField(
                            "experiences",
                            expIndex,
                            "company",
                            e.target.value
                          )
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Missions
                        </label>
                        <button
                          onClick={() => addMission(expIndex)}
                          className="flex items-center gap-1 px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                        >
                          <Plus size={14} />
                          Mission
                        </button>
                      </div>

                      <div className="space-y-2">
                        {exp.missions.map((mission, missionIndex) => (
                          <div key={missionIndex} className="flex gap-2">
                            <textarea
                              value={mission}
                              onChange={(e) =>
                                updateMission(
                                  expIndex,
                                  missionIndex,
                                  e.target.value
                                )
                              }
                              rows={2}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                              placeholder="Mission ou Stack"
                            />
                            <button
                              onClick={() =>
                                removeMission(expIndex, missionIndex)
                              }
                              className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* LANGUAGES */}
            {activeSection === "languages" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-800">Langues</h3>
                  <button
                    onClick={addLanguage}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Plus size={18} />
                    Ajouter
                  </button>
                </div>

                {data.languages.map((lang, index) => (
                  <div
                    key={index}
                    className="border border-gray-300 rounded-lg p-4 space-y-3 bg-gray-50"
                  >
                    <div className="flex justify-between items-start">
                      <h4 className="text-sm font-bold text-gray-700">
                        Langue {index + 1}
                      </h4>
                      <button
                        onClick={() => removeLanguage(index)}
                        className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Nom
                        </label>
                        <input
                          type="text"
                          value={lang.name}
                          onChange={(e) =>
                            updateArrayField("languages", index, "name", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Drapeau
                        </label>
                        <input
                          type="text"
                          value={lang.flag}
                          onChange={(e) =>
                            updateArrayField("languages", index, "flag", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                          placeholder="🇫🇷"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Niveau
                        </label>
                        <input
                          type="text"
                          value={lang.level}
                          onChange={(e) =>
                            updateArrayField("languages", index, "level", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* CERTIFICATIONS */}
            {activeSection === "certifications" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-800">
                    Certifications
                  </h3>
                  <button
                    onClick={addCertification}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Plus size={18} />
                    Ajouter
                  </button>
                </div>

                {data.certifications.map((cert, index) => (
                  <div
                    key={index}
                    className="border border-gray-300 rounded-lg p-4 space-y-3 bg-gray-50"
                  >
                    <div className="flex justify-between items-start">
                      <h4 className="text-sm font-bold text-gray-700">
                        Certification {index + 1}
                      </h4>
                      <button
                        onClick={() => removeCertification(index)}
                        className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Nom
                        </label>
                        <input
                          type="text"
                          value={cert.name}
                          onChange={(e) =>
                            updateArrayField(
                              "certifications",
                              index,
                              "name",
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Organisme
                        </label>
                        <input
                          type="text"
                          value={cert.issuer}
                          onChange={(e) =>
                            updateArrayField(
                              "certifications",
                              index,
                              "issuer",
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* CUSTOM SECTIONS */}
            {data.customSections.map((customSection) =>
              activeSection === customSection.id && (
                <div key={customSection.id} className="space-y-4">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-800">
                      Section Personnalisée
                    </h3>
                    <button
                      onClick={() => removeCustomSection(customSection.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      <Trash2 size={18} />
                      Supprimer Section
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Titre de la Section
                    </label>
                    <input
                      type="text"
                      value={customSection.title}
                      onChange={(e) => updateCustomSectionTitle(customSection.id, e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: Projets, Publications, Récompenses..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sous-titre (optionnel)
                    </label>
                    <input
                      type="text"
                      value={customSection.subtitle || ""}
                      onChange={(e) => updateCustomSectionSubtitle(customSection.id, e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Sous-titre optionnel"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Contenu
                      </label>
                      <button
                        onClick={() => addCustomSectionBlock(customSection.id)}
                        className="flex items-center gap-1 px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                      >
                        <Plus size={14} />
                        Bloc
                      </button>
                    </div>

                    <div className="space-y-2">
                      {customSection.blocks.map((block, blockIndex) => (
                        <div key={blockIndex} className="flex gap-2">
                          <textarea
                            value={block}
                            onChange={(e) => updateCustomSectionBlock(customSection.id, blockIndex, e.target.value)}
                            rows={3}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                            placeholder="Contenu du bloc"
                          />
                          <button
                            onClick={() => removeCustomSectionBlock(customSection.id, blockIndex)}
                            className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        </div>

        {/* RIGHT SIDE — LIVE PREVIEW */}
        <div className="w-full lg:w-2/4 overflow-y-auto p-4 bg-gray-50">
          <PrintableCVContent data={data} activeSection={activeSection} />
        </div>

      </div>
    </div>
  );
};

export default CVEditor;
=======
import { Save, RotateCcw, Eye, Edit, Plus, Trash2, Layers } from "lucide-react";
import type { CVData, TechnologyCategory, Experience, CustomSection } from "../types/cv";
import PrintableCVContent from "./PrintableCVContent";
import { useState, useEffect } from 'react';
import { createCustomSection } from '../utils/cvHelpers';
import { useLanguage } from '../contexts/LanguageContext';

export interface CVEditorProps {
  data: CVData;
  onUpdate: (data: CVData) => void;
  onSave: () => void;
  onReset: () => void;
  onTogglePreview: () => void;
  isPreviewMode: boolean;
}

const CVEditor: React.FC<CVEditorProps> = ({
  data,
  onUpdate,
  onSave,
  onReset,
  onTogglePreview,
  isPreviewMode,
}) => {
  const [activeSection, setActiveSection] = useState<string>("personal");
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(data.personalInfo.avatarUrl || null);
  const { t } = useLanguage();

  // Effect to update preview URL if data.personalInfo.avatarUrl changes
  useEffect(() => {
    setImagePreviewUrl(data.personalInfo.avatarUrl || null);
  }, [data.personalInfo.avatarUrl]);

  // ---------------------------------------
  // UPDATE HELPERS
  // ---------------------------------------

  const updateField = (path: string[], value: string) => {
    const newData = { ...data };
    let current: any = newData;

    for (let i = 0; i < path.length - 1; i++) {
      current = current[path[i]];
    }

    current[path[path.length - 1]] = value;
    onUpdate(newData);
  };

  // Helper to update a specific field in an array of objects
  const updateArrayField = (
    section: keyof CVData,
    index: number,
    field: string,
    value: string
  ) => {
    const newData = { ...data };
    const array = newData[section] as any[];
    // Ensure the item at the index exists and is an object before updating
    if (array && array[index] && typeof array[index] === 'object') {
      array[index] = { ...array[index], [field]: value };
    } else if (section === 'skills' && typeof array[index] === 'string') {
      // Special handling for skills which are strings
      array[index] = value;
    }
    onUpdate(newData);
  };

  // ---------------------------------------
  // ITEMS ADD/REMOVE
  // ---------------------------------------

  const addExperience = () => {
    const newExp: Experience = {
      id: Date.now().toString(),
      jobTitle: "",
      company: "",
      missions: [""],
    };
    onUpdate({ ...data, experiences: [...data.experiences, newExp] });
  };

  const removeExperience = (index: number) => {
    onUpdate({
      ...data,
      experiences: data.experiences.filter((_, i) => i !== index),
    });
  };

  const addMission = (expIndex: number) => {
    const newData = { ...data };
    newData.experiences[expIndex].missions.push("");
    onUpdate(newData);
  };

  const removeMission = (expIndex: number, missionIndex: number) => {
    const newData = { ...data };
    newData.experiences[expIndex].missions = newData.experiences[
      expIndex
    ].missions.filter((_, i) => i !== missionIndex);
    onUpdate(newData);
  };

  const updateMission = (
    expIndex: number,
    missionIndex: number,
    value: string
  ) => {
    const newData = { ...data };
    newData.experiences[expIndex].missions[missionIndex] = value;
    onUpdate(newData);
  };

  const addLanguage = () => {
    onUpdate({
      ...data,
      languages: [...data.languages, { name: "", flag: "", level: "" }],
    });
  };

  const removeLanguage = (index: number) => {
    onUpdate({
      ...data,
      languages: data.languages.filter((_, i) => i !== index),
    });
  };

  const addCertification = () => {
    onUpdate({
      ...data,
      certifications: [...data.certifications, { name: "", issuer: "" }],
    });
  };

  const removeCertification = (index: number) => {
    onUpdate({
      ...data,
      certifications: data.certifications.filter((_, i) => i !== index),
    });
  };

  const addSkill = () => {
    onUpdate({ ...data, skills: [...data.skills, ""] });
  };

  const removeSkill = (index: number) => {
    onUpdate({
      ...data,
      skills: data.skills.filter((_, i) => i !== index),
    });
  };

  const updateSkill = (index: number, value: string) => {
    const newData = { ...data };
    newData.skills[index] = value;
    onUpdate(newData);
  };

  // --- Technologies Section Handlers ---

  const addTechnologyCategory = () => {
    const newCategory: TechnologyCategory = { id: Date.now().toString(), title: "", items: "" };
    onUpdate({ ...data, technologies: [...data.technologies, newCategory] });
  };

  const removeTechnologyCategory = (index: number) => {
    onUpdate({
      ...data,
      technologies: data.technologies.filter((_, i) => i !== index),
    });
  };

  const updateTechnologyTitle = (index: number, title: string) => {
    const newData = { ...data };
    newData.technologies[index].title = title;
    onUpdate(newData);
  };

  const updateTechnologyItems = (index: number, items: string) => {
    const newData = { ...data };
    newData.technologies[index].items = items;
    onUpdate(newData);
  };

  // --- Custom Section Handlers ---
  const addCustomSection = () => {
    const newSection = createCustomSection("Nouvelle Section", "");
    const newData = { ...data };
    newData.customSections.push(newSection);
    newData.sectionOrder.push(newSection.id);
    onUpdate(newData);
    setActiveSection(newSection.id);
  };

  const removeCustomSection = (id: string) => {
    const newData = { ...data };
    newData.customSections = newData.customSections.filter(s => s.id !== id);
    newData.sectionOrder = newData.sectionOrder.filter(sid => sid !== id);
    onUpdate(newData);
    if (activeSection === id) {
      setActiveSection("personal");
    }
  };

  const updateCustomSectionTitle = (id: string, title: string) => {
    const newData = { ...data };
    const section = newData.customSections.find(s => s.id === id);
    if (section) section.title = title;
    onUpdate(newData);
  };

  const updateCustomSectionSubtitle = (id: string, subtitle: string) => {
    const newData = { ...data };
    const section = newData.customSections.find(s => s.id === id);
    if (section) section.subtitle = subtitle;
    onUpdate(newData);
  };

  const addCustomSectionBlock = (id: string) => {
    const newData = { ...data };
    const section = newData.customSections.find(s => s.id === id);
    if (section) section.blocks.push("");
    onUpdate(newData);
  };

  const removeCustomSectionBlock = (id: string, blockIndex: number) => {
    const newData = { ...data };
    const section = newData.customSections.find(s => s.id === id);
    if (section) section.blocks = section.blocks.filter((_, i) => i !== blockIndex);
    onUpdate(newData);
  };

  const updateCustomSectionBlock = (id: string, blockIndex: number, value: string) => {
    const newData = { ...data };
    const section = newData.customSections.find(s => s.id === id);
    if (section) section.blocks[blockIndex] = value;
    onUpdate(newData);
  };

  // --- Image Upload Handlers ---
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (5MB limit)
      const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSizeInBytes) {
        alert("Le fichier dépasse la limite de 5 Mo.");
        event.target.value = ""; // Clear the input
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const newAvatarUrl = reader.result as string;
        updateField(["personalInfo", "avatarUrl"], newAvatarUrl);
        setImagePreviewUrl(newAvatarUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    updateField(["personalInfo", "avatarUrl"], "");
    setImagePreviewUrl(null);
    // Clear the file input if it exists
    const fileInput = document.getElementById('avatarInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  // ---------------------------------------
  // SECTIONS LIST
  // ---------------------------------------

  const sections = [
    { id: "personal", label: t('personalInfo'), icon: "👤" },
    { id: "profile", label: t('profile'), icon: "📝" },
    { id: "contact", label: t('contact'), icon: "📧" },
    { id: "skills", label: t('skills'), icon: "⚡" },
    { id: "technologies", label: t('technologies'), icon: "💻" },
    { id: "experiences", label: t('experiences'), icon: "💼" },
    { id: "languages", label: t('languages'), icon: "🌐" },
    { id: "certifications", label: t('certifications'), icon: "🏆" },
    ...data.customSections.map(section => ({
      id: section.id,
      label: section.title || t('customSection'),
      icon: "📑"
    }))
  ];

  // ---------------------------------------
  // RETURN UI
  // ---------------------------------------

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* HEADER */}
      <div className="bg-gray-800 text-white p-4 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-3">
          <Edit size={24} />
          <h2 className="text-xl font-bold">{t('editor')}</h2>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onTogglePreview}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            {isPreviewMode ? <Edit size={18} /> : <Eye size={18} />}
            {isPreviewMode ? t('edit') : t('preview')}
          </button>

          <button
            onClick={onReset}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <RotateCcw size={18} />
            {t('reset')}
          </button>

          <button
            onClick={onSave}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
          >
            <Save size={18} />
            {t('save')}
          </button>
        </div>
      </div>

      {/* MAIN SPLIT VIEW - Responsive: stacked on mobile (<lg), side-by-side on desktop (>=lg) */}
      <div className="flex flex-1 overflow-hidden flex-col lg:flex-row">

        {/* LEFT SIDE — EDITOR */}
        <div className="w-full lg:w-2/4 overflow-y-auto p-4 lg:p-8 border-b lg:border-b-0 lg:border-r border-gray-200">
          <div className="w-full max-w-[650px] mx-auto space-y-6">

            <div className="flex flex-1 overflow-hidden">
                <div className="bg-gray-50 border-r border-gray-200 w-full">
                  <nav className="p-4 flex gap-2 overflow-x-auto whitespace-nowrap flex-wrap">
                    {sections.map((section) => (
                      <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={`inline-flex items-center gap-3 min-w-[140px] text-left px-4 py-3 rounded-lg transition-colors ${
                          activeSection === section.id
                            ? 'bg-blue-600 text-white'
                            : 'hover:bg-gray-200 text-gray-700'
                        }`}
                      >
                        <span className="text-xl">{section.icon}</span>
                        <span className="font-medium">{section.label}</span>
                      </button>
                    ))}
                    <button
                      onClick={addCustomSection}
                      className="inline-flex items-center gap-2 min-w-[140px] text-left px-4 py-3 rounded-lg transition-colors border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50 text-gray-600 hover:text-blue-600"
                    >
                      <Plus size={18} />
                      <span className="font-medium">Section Personnalisée</span>
                    </button>
                  </nav>
                </div>
            </div>

            {/* -------------------- PERSONAL -------------------- */}
            {activeSection === "personal" && (
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-gray-800 mb-6">
                  Informations Personnelles
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom Complet
                  </label>
                  <input
                    type="text"
                    value={data.personalInfo.fullName}
                    onChange={(e) =>
                      updateField(["personalInfo", "fullName"], e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Titre Professionnel
                  </label>
                  <input
                    type="text"
                    value={data.personalInfo.professionalTitle}
                    onChange={(e) =>
                      updateField(
                        ["personalInfo", "professionalTitle"],
                        e.target.value
                      )
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Image Upload Section */}
                
                <div className="mt-4 border-2 border-gray-400 rounded-lg p-8">

                 
                  {!imagePreviewUrl && (
                   <button
                    onClick={() => document.getElementById('avatarInput')?.click()}
                    className="flex justify-center items-center mx-auto my-1 gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 rounded-lg text-white font-medium transition"
                    >
                      
                      <span className="text-2xl">📸</span> 
                      Importer votre image portfeuil
                    </button>
                  )}

                  {/* Hidden Input used for selecting file */}

                  <div className="flex justify-between items-center">                   

                  {/* ✅ If image exists → show preview */}
                  {imagePreviewUrl && (
                    <div className="flex items-center gap-4 mt-6">

                      <div className="relative w-24 h-24 rounded-full border-2 border-gray-100 overflow-visible">
                        <img
                          src={imagePreviewUrl}
                          alt="Aperçu de la photo"
                          className="w-full h-full rounded-full object-cover"
                        />

                        {/* Delete button */}
                        <button
                          onClick={handleRemoveImage}
                          className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 shadow-lg hover:bg-red-700"
                          aria-label="Supprimer la photo"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                    </div>
                  )}
                  <div>
                   <input id="avatarInput" 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageChange} 
                    className=
                    {`${!imagePreviewUrl ? 'hidden' : 'block pointer text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-600'}`}
                   />
                   {imagePreviewUrl && (
                     <p className="text-xs text-gray-500 mt-1"> Max 5 Mo. Formats acceptés : JPG, PNG, GIF. </p>
                   )}
                   </div>
                  </div>

                </div>

              </div>
            )}

            {/* PROFILE */}
            {activeSection === "profile" && (
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-gray-800 mb-6">
                  Profil Professionnel
                </h3>

                <textarea
                  value={data.profile}
                  onChange={(e) => updateField(["profile"], e.target.value)}
                  rows={8}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}

            {/* CONTACT */}
            {activeSection === "contact" && (
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-gray-800 mb-6">
                  Contact
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={data.contact.email}
                    onChange={(e) =>
                      updateField(["contact", "email"], e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    value={data.contact.phone}
                    onChange={(e) =>
                      updateField(["contact", "phone"], e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Localisation
                  </label>
                  <input
                    type="text"
                    value={data.contact.location}
                    onChange={(e) =>
                      updateField(["contact", "location"], e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    GitHub
                  </label>
                  <input
                    type="text"
                    value={data.contact.github}
                    onChange={(e) =>
                      updateField(["contact", "github"], e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    LinkedIn
                  </label>
                  <input
                    type="text"
                    value={data.contact.linkedin}
                    onChange={(e) =>
                      updateField(["contact", "linkedin"], e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            )}

            {/* SKILLS */}
            {activeSection === "skills" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-800">
                    Domaines de Compétences
                  </h3>
                  <button
                    onClick={addSkill}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Plus size={18} />
                    Ajouter
                  </button>
                </div>

                {data.skills.map((skill, index) => (
                  <div key={index} className="flex gap-2">
                    <textarea
                      value={skill}
                      onChange={(e) => updateSkill(index, e.target.value)}
                      rows={2}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Compétence"
                    />
                    <button
                      onClick={() => removeSkill(index)}
                      className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* TECHNOLOGIES */}
            {activeSection === "technologies" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-800">
                    Environnements Techniques
                  </h3>
                  <button
                    onClick={addTechnologyCategory}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Plus size={18} />
                    Ajouter Catégorie
                  </button>
                </div>

                {data.technologies.map((techCategory, index) => (
                  <div
                    key={index}
                    className="border border-gray-300 rounded-lg p-4 bg-gray-50 space-y-4"
                  >
                    <div className="flex justify-between items-center">
                      <input
                        type="text"
                        value={techCategory.title}
                        onChange={(e) =>
                          updateTechnologyTitle(index, e.target.value)
                        }
                        className="text-lg font-semibold text-gray-800 px-2 py-1 border border-gray-300 rounded-lg flex-1"
                        placeholder="Titre de la catégorie"
                      />
                      <button
                        onClick={() => removeTechnologyCategory(index)}
                        className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 ml-3"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Éléments (séparés par des virgules)
                      </label>
                      <textarea
                        value={techCategory.items}
                        onChange={(e) =>
                          updateTechnologyItems(index, e.target.value)
                        }
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Ex: PHP 7, JavaScript, TypeScript"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* EXPERIENCES */}
            {activeSection === "experiences" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-800">
                    Expériences Professionnelles
                  </h3>
                  <button
                    onClick={addExperience}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Plus size={18} />
                    Ajouter
                  </button>
                </div>

                {data.experiences.map((exp, expIndex) => (
                  <div
                    key={exp.id}
                    className="border border-gray-300 rounded-lg p-6 space-y-4 bg-gray-50"
                  >
                    <div className="flex justify-between items-start">
                      <h4 className="text-lg font-bold text-gray-800">
                        Expérience {expIndex + 1}
                      </h4>
                      <button
                        onClick={() => removeExperience(expIndex)}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Titre du Poste
                      </label>
                      <input
                        type="text"
                        value={exp.jobTitle}
                        onChange={(e) =>
                          updateArrayField(
                            "experiences",
                            expIndex,
                            "jobTitle",
                            e.target.value
                          )
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Entreprise
                      </label>
                      <input
                        type="text"
                        value={exp.company}
                        onChange={(e) =>
                          updateArrayField(
                            "experiences",
                            expIndex,
                            "company",
                            e.target.value
                          )
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Missions
                        </label>
                        <button
                          onClick={() => addMission(expIndex)}
                          className="flex items-center gap-1 px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                        >
                          <Plus size={14} />
                          Mission
                        </button>
                      </div>

                      <div className="space-y-2">
                        {exp.missions.map((mission, missionIndex) => (
                          <div key={missionIndex} className="flex gap-2">
                            <textarea
                              value={mission}
                              onChange={(e) =>
                                updateMission(
                                  expIndex,
                                  missionIndex,
                                  e.target.value
                                )
                              }
                              rows={2}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                              placeholder="Mission ou Stack"
                            />
                            <button
                              onClick={() =>
                                removeMission(expIndex, missionIndex)
                              }
                              className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* LANGUAGES */}
            {activeSection === "languages" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-800">Langues</h3>
                  <button
                    onClick={addLanguage}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Plus size={18} />
                    Ajouter
                  </button>
                </div>

                {data.languages.map((lang, index) => (
                  <div
                    key={index}
                    className="border border-gray-300 rounded-lg p-4 space-y-3 bg-gray-50"
                  >
                    <div className="flex justify-between items-start">
                      <h4 className="text-sm font-bold text-gray-700">
                        Langue {index + 1}
                      </h4>
                      <button
                        onClick={() => removeLanguage(index)}
                        className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Nom
                        </label>
                        <input
                          type="text"
                          value={lang.name}
                          onChange={(e) =>
                            updateArrayField("languages", index, "name", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Drapeau
                        </label>
                        <input
                          type="text"
                          value={lang.flag}
                          onChange={(e) =>
                            updateArrayField("languages", index, "flag", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                          placeholder="🇫🇷"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Niveau
                        </label>
                        <input
                          type="text"
                          value={lang.level}
                          onChange={(e) =>
                            updateArrayField("languages", index, "level", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* CERTIFICATIONS */}
            {activeSection === "certifications" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-800">
                    Certifications
                  </h3>
                  <button
                    onClick={addCertification}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Plus size={18} />
                    Ajouter
                  </button>
                </div>

                {data.certifications.map((cert, index) => (
                  <div
                    key={index}
                    className="border border-gray-300 rounded-lg p-4 space-y-3 bg-gray-50"
                  >
                    <div className="flex justify-between items-start">
                      <h4 className="text-sm font-bold text-gray-700">
                        Certification {index + 1}
                      </h4>
                      <button
                        onClick={() => removeCertification(index)}
                        className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Nom
                        </label>
                        <input
                          type="text"
                          value={cert.name}
                          onChange={(e) =>
                            updateArrayField(
                              "certifications",
                              index,
                              "name",
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Organisme
                        </label>
                        <input
                          type="text"
                          value={cert.issuer}
                          onChange={(e) =>
                            updateArrayField(
                              "certifications",
                              index,
                              "issuer",
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* CUSTOM SECTIONS */}
            {data.customSections.map((customSection) =>
              activeSection === customSection.id && (
                <div key={customSection.id} className="space-y-4">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-800">
                      Section Personnalisée
                    </h3>
                    <button
                      onClick={() => removeCustomSection(customSection.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      <Trash2 size={18} />
                      Supprimer Section
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Titre de la Section
                    </label>
                    <input
                      type="text"
                      value={customSection.title}
                      onChange={(e) => updateCustomSectionTitle(customSection.id, e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: Projets, Publications, Récompenses..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sous-titre (optionnel)
                    </label>
                    <input
                      type="text"
                      value={customSection.subtitle || ""}
                      onChange={(e) => updateCustomSectionSubtitle(customSection.id, e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Sous-titre optionnel"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Contenu
                      </label>
                      <button
                        onClick={() => addCustomSectionBlock(customSection.id)}
                        className="flex items-center gap-1 px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                      >
                        <Plus size={14} />
                        Bloc
                      </button>
                    </div>

                    <div className="space-y-2">
                      {customSection.blocks.map((block, blockIndex) => (
                        <div key={blockIndex} className="flex gap-2">
                          <textarea
                            value={block}
                            onChange={(e) => updateCustomSectionBlock(customSection.id, blockIndex, e.target.value)}
                            rows={3}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                            placeholder="Contenu du bloc"
                          />
                          <button
                            onClick={() => removeCustomSectionBlock(customSection.id, blockIndex)}
                            className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        </div>

        {/* RIGHT SIDE — LIVE PREVIEW */}
        <div className="w-full lg:w-2/4 overflow-y-auto p-4 bg-gray-50">
          <PrintableCVContent data={data} activeSection={activeSection} />
        </div>

      </div>
    </div>
  );
};

export default CVEditor;
>>>>>>> faadcf2 (ùtest commit)
