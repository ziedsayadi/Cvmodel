import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';
import type { CVData, Experience, Language, Certification } from '../types/cv';

interface FormPanelProps {
  data: CVData;
  onUpdate: (data: CVData) => void;
}

interface ExpandedSections {
  [key: string]: boolean;
}

const FormPanel: React.FC<FormPanelProps> = ({ data, onUpdate }) => {
  const [expanded, setExpanded] = useState<ExpandedSections>({
    personal: true,
    profile: true,
    contact: true,
    skills: true,
    technologies: true,
    experiences: true,
    languages: false,
    certifications: false
  });

  const toggleSection = (section: string) => {
    setExpanded(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const updateField = (path: string[], value: string) => {
    const newData = { ...data };
    let current: any = newData;

    for (let i = 0; i < path.length - 1; i++) {
      current = current[path[i]];
    }

    current[path[path.length - 1]] = value;
    onUpdate(newData);
  };

  const updateArrayField = (section: keyof CVData, index: number, field: string, value: string) => {
    const newData = { ...data };
    const array = newData[section] as any[];
    if (Array.isArray(array[index])) {
      array[index] = { ...array[index], [field]: value };
    } else {
      array[index] = value;
    }
    onUpdate(newData);
  };

  const addItem = (section: keyof CVData, template: any) => {
    const newData = { ...data };
    const array = newData[section] as any[];
    array.push(template);
    onUpdate(newData);
  };

  const removeItem = (section: keyof CVData, index: number) => {
    const newData = { ...data };
    const array = newData[section] as any[];
    array.splice(index, 1);
    onUpdate(newData);
  };

  const addMission = (expIndex: number) => {
    const newData = { ...data };
    newData.experiences[expIndex].missions.push('');
    onUpdate(newData);
  };

  const removeMission = (expIndex: number, missionIndex: number) => {
    const newData = { ...data };
    newData.experiences[expIndex].missions.splice(missionIndex, 1);
    onUpdate(newData);
  };

  const updateMission = (expIndex: number, missionIndex: number, value: string) => {
    const newData = { ...data };
    newData.experiences[expIndex].missions[missionIndex] = value;
    onUpdate(newData);
  };

  const SectionHeader = ({ title, section }: { title: string; section: string }) => (
    <button
      onClick={() => toggleSection(section)}
      className="w-full flex items-center justify-between px-4 py-3 bg-gray-700 hover:bg-gray-650 text-white font-semibold transition-colors"
    >
      <span>{title}</span>
      {expanded[section] ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
    </button>
  );

  const InputField = ({
    label,
    value,
    onChange,
    type = 'text',
    rows = undefined
  }: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    type?: string;
    rows?: number;
  }) => (
    <div className="space-y-1">
      <label className="text-xs font-medium text-gray-300">{label}</label>
      {rows ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
      )}
    </div>
  );

  return (
    <div className="overflow-y-auto flex-1 bg-gray-800">
      <div className="space-y-0">
        <div className="bg-gray-800">
          <SectionHeader title="Personal Information" section="personal" />
          {expanded.personal && (
            <div className="px-4 py-4 space-y-4 bg-gray-750 border-b border-gray-700">
              <InputField
                label="Full Name"
                value={data.personalInfo.fullName}
                onChange={(value) => updateField(['personalInfo', 'fullName'], value)}
              />
              <InputField
                label="Professional Title"
                value={data.personalInfo.professionalTitle}
                onChange={(value) => updateField(['personalInfo', 'professionalTitle'], value)}
              />
              <InputField
                label="Avatar URL"
                value={data.personalInfo.avatarUrl}
                onChange={(value) => updateField(['personalInfo', 'avatarUrl'], value)}
              />
            </div>
          )}
        </div>

        <div className="bg-gray-800">
          <SectionHeader title="Professional Profile" section="profile" />
          {expanded.profile && (
            <div className="px-4 py-4 space-y-4 bg-gray-750 border-b border-gray-700">
              <InputField
                label="Profile Description"
                value={data.profile}
                onChange={(value) => updateField(['profile'], value)}
                rows={6}
              />
            </div>
          )}
        </div>

        <div className="bg-gray-800">
          <SectionHeader title="Contact Information" section="contact" />
          {expanded.contact && (
            <div className="px-4 py-4 space-y-4 bg-gray-750 border-b border-gray-700">
              <InputField
                label="Email"
                type="email"
                value={data.contact.email}
                onChange={(value) => updateField(['contact', 'email'], value)}
              />
              <InputField
                label="Phone"
                type="tel"
                value={data.contact.phone}
                onChange={(value) => updateField(['contact', 'phone'], value)}
              />
              <InputField
                label="Location"
                value={data.contact.location}
                onChange={(value) => updateField(['contact', 'location'], value)}
              />
              <InputField
                label="GitHub"
                value={data.contact.github}
                onChange={(value) => updateField(['contact', 'github'], value)}
              />
              <InputField
                label="LinkedIn"
                value={data.contact.linkedin}
                onChange={(value) => updateField(['contact', 'linkedin'], value)}
              />
            </div>
          )}
        </div>

        <div className="bg-gray-800">
          <SectionHeader title="Skills" section="skills" />
          {expanded.skills && (
            <div className="px-4 py-4 space-y-3 bg-gray-750 border-b border-gray-700">
              {data.skills.map((skill, index) => (
                <div key={index} className="flex gap-2">
                  <textarea
                    value={skill}
                    onChange={(e) => updateArrayField('skills', index, '', e.target.value)}
                    rows={2}
                    className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
                  />
                  <button
                    onClick={() => removeItem('skills', index)}
                    className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              <button
                onClick={() => addItem('skills', '')}
                className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors text-sm font-medium flex items-center justify-center gap-2"
              >
                <Plus size={16} />
                Add Skill
              </button>
            </div>
          )}
        </div>

        <div className="bg-gray-800">
          <SectionHeader title="Technologies" section="technologies" />
          {expanded.technologies && (
            <div className="px-4 py-4 space-y-3 bg-gray-750 border-b border-gray-700">
              {data.technologies.map((tech, index) => (
                <div key={index} className="flex gap-2">
                  <textarea
                    value={tech}
                    onChange={(e) => updateArrayField('technologies', index, '', e.target.value)}
                    rows={2}
                    className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
                  />
                  <button
                    onClick={() => removeItem('technologies', index)}
                    className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              <button
                onClick={() => addItem('technologies', '')}
                className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors text-sm font-medium flex items-center justify-center gap-2"
              >
                <Plus size={16} />
                Add Technology
              </button>
            </div>
          )}
        </div>

        <div className="bg-gray-800">
          <SectionHeader title="Experiences" section="experiences" />
          {expanded.experiences && (
            <div className="px-4 py-4 space-y-4 bg-gray-750 border-b border-gray-700">
              {data.experiences.map((exp, expIndex) => (
                <div key={exp.id} className="border border-gray-600 rounded-lg p-3 space-y-3 bg-gray-800">
                  <div className="flex justify-between items-start">
                    <h4 className="font-semibold text-white text-sm">Experience {expIndex + 1}</h4>
                    <button
                      onClick={() => removeItem('experiences', expIndex)}
                      className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <InputField
                    label="Job Title"
                    value={exp.jobTitle}
                    onChange={(value) => updateArrayField('experiences', expIndex, 'jobTitle', value)}
                  />
                  <InputField
                    label="Company"
                    value={exp.company}
                    onChange={(value) => updateArrayField('experiences', expIndex, 'company', value)}
                  />
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-xs font-medium text-gray-300">Missions</label>
                      <button
                        onClick={() => addMission(expIndex)}
                        className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs transition-colors flex items-center gap-1"
                      >
                        <Plus size={12} />
                        Add
                      </button>
                    </div>
                    <div className="space-y-2">
                      {exp.missions.map((mission, missionIndex) => (
                        <div key={missionIndex} className="flex gap-2">
                          <textarea
                            value={mission}
                            onChange={(e) => updateMission(expIndex, missionIndex, e.target.value)}
                            rows={2}
                            className="flex-1 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-xs placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
                          />
                          <button
                            onClick={() => removeMission(expIndex, missionIndex)}
                            className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
              <button
                onClick={() =>
                  addItem('experiences', {
                    id: Date.now().toString(),
                    jobTitle: '',
                    company: '',
                    missions: ['']
                  })
                }
                className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors text-sm font-medium flex items-center justify-center gap-2"
              >
                <Plus size={16} />
                Add Experience
              </button>
            </div>
          )}
        </div>

        <div className="bg-gray-800">
          <SectionHeader title="Languages" section="languages" />
          {expanded.languages && (
            <div className="px-4 py-4 space-y-3 bg-gray-750 border-b border-gray-700">
              {data.languages.map((lang, index) => (
                <div key={index} className="border border-gray-600 rounded-lg p-3 space-y-2 bg-gray-800">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-semibold text-white">Language {index + 1}</h4>
                    <button
                      onClick={() => removeItem('languages', index)}
                      className="px-1 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs transition-colors"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <InputField
                      label="Name"
                      value={lang.name}
                      onChange={(value) => updateArrayField('languages', index, 'name', value)}
                    />
                    <InputField
                      label="Flag"
                      value={lang.flag}
                      onChange={(value) => updateArrayField('languages', index, 'flag', value)}
                    />
                    <InputField
                      label="Level"
                      value={lang.level}
                      onChange={(value) => updateArrayField('languages', index, 'level', value)}
                    />
                  </div>
                </div>
              ))}
              <button
                onClick={() => addItem('languages', { name: '', flag: '', level: '' })}
                className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors text-sm font-medium flex items-center justify-center gap-2"
              >
                <Plus size={16} />
                Add Language
              </button>
            </div>
          )}
        </div>

        <div className="bg-gray-800">
          <SectionHeader title="Certifications" section="certifications" />
          {expanded.certifications && (
            <div className="px-4 py-4 space-y-3 bg-gray-750 border-b border-gray-700">
              {data.certifications.map((cert, index) => (
                <div key={index} className="border border-gray-600 rounded-lg p-3 space-y-2 bg-gray-800">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-semibold text-white">Certification {index + 1}</h4>
                    <button
                      onClick={() => removeItem('certifications', index)}
                      className="px-1 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs transition-colors"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                  <InputField
                    label="Name"
                    value={cert.name}
                    onChange={(value) => updateArrayField('certifications', index, 'name', value)}
                  />
                  <InputField
                    label="Issuer"
                    value={cert.issuer}
                    onChange={(value) => updateArrayField('certifications', index, 'issuer', value)}
                  />
                </div>
              ))}
              <button
                onClick={() => addItem('certifications', { name: '', issuer: '' })}
                className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors text-sm font-medium flex items-center justify-center gap-2"
              >
                <Plus size={16} />
                Add Certification
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FormPanel;
