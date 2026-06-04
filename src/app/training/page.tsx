'use client';

import { useState } from 'react';
import { BookOpen, CheckCircle, Play, Lock, Award, Clock, Users, Brain } from 'lucide-react';
import AIAgentPanel from '@/components/AIAgentPanel';

const TRAINING_MODULES = [
  {
    id: 1, category: 'Fondements', title: 'Valeurs et vision du parti',
    desc: 'Les principes fondateurs de Congo D\'Abord — compétence, transparence, méritocratie.',
    duration: 2, level: 'Basique', required: true, completed: true, score: 92,
  },
  {
    id: 2, category: 'Droit & Gouvernance', title: 'Constitution de la RDC',
    desc: 'Les articles fondamentaux, les droits citoyens et le cadre institutionnel de l\'État congolais.',
    duration: 4, level: 'Intermédiaire', required: true, completed: true, score: 88,
  },
  {
    id: 3, category: 'Droit & Gouvernance', title: 'Décentralisation et gouvernance locale',
    desc: 'Structure territoriale de la RDC, compétences des entités décentralisées.',
    duration: 3, level: 'Intermédiaire', required: true, completed: false, score: null,
  },
  {
    id: 4, category: 'Leadership', title: 'Gouvernance locale',
    desc: 'Gestion des services publics au niveau communal, territorial et provincial.',
    duration: 3, level: 'Intermédiaire', required: true, completed: false, score: null,
  },
  {
    id: 5, category: 'Communication', title: 'Prise de parole publique',
    desc: 'Techniques oratoires, gestion du stress, argumentation politique en contexte congolais.',
    duration: 2, level: 'Basique', required: false, completed: false, score: null,
  },
  {
    id: 6, category: 'Éthique', title: 'Anti-corruption',
    desc: 'Mécanismes de corruption, droit pénal, outils de signalement et protection des lanceurs d\'alerte.',
    duration: 3, level: 'Avancé', required: true, completed: false, score: null,
  },
  {
    id: 7, category: 'Finance', title: 'Finances publiques',
    desc: 'Budget de l\'État, loi de finances, contrôle de la dépense publique en RDC.',
    duration: 4, level: 'Avancé', required: false, completed: false, score: null,
  },
  {
    id: 8, category: 'Leadership', title: 'Organisation communautaire',
    desc: 'Mobilisation citoyenne, gestion de conflits locaux, animation de réunions de base.',
    duration: 2, level: 'Basique', required: true, completed: false, score: null,
  },
  {
    id: 9, category: 'Leadership', title: 'Gestion des conflits',
    desc: 'Techniques de médiation, résolution pacifique des différends politiques et communautaires.',
    duration: 2, level: 'Intermédiaire', required: false, completed: false, score: null,
  },
  {
    id: 10, category: 'Droit & Gouvernance', title: 'Droit électoral — bases',
    desc: 'Loi électorale congolaise, processus de candidature, droit de vote et observation.',
    duration: 3, level: 'Intermédiaire', required: true, completed: false, score: null,
  },
  {
    id: 11, category: 'Éthique', title: 'Éthique et intégrité politique',
    desc: 'Code d\'éthique du parti, obligations du dirigeant, conflits d\'intérêts.',
    duration: 2, level: 'Basique', required: true, completed: false, score: null,
  },
  {
    id: 12, category: 'Communication', title: 'Relations avec les médias',
    desc: 'Interview télévisée, gestion de crise médiatique, communication sur les réseaux sociaux.',
    duration: 2, level: 'Intermédiaire', required: false, completed: false, score: null,
  },
  {
    id: 13, category: 'Numérique', title: 'Sécurité numérique',
    desc: 'Protection des données du parti, cybersécurité de base, utilisation sécurisée du CDP-AI OS.',
    duration: 2, level: 'Basique', required: false, completed: false, score: null,
  },
  {
    id: 14, category: 'Leadership', title: 'Rédaction de politiques publiques',
    desc: 'Méthodes de rédaction de propositions de loi, notes de politique et manifestes électoraux.',
    duration: 4, level: 'Avancé', required: false, completed: false, score: null,
  },
];

const CATEGORIES = ['Tous', 'Fondements', 'Droit & Gouvernance', 'Leadership', 'Communication', 'Éthique', 'Finance', 'Numérique'];
const LEVELS = ['Tous', 'Basique', 'Intermédiaire', 'Avancé'];
const LEVEL_COLORS: Record<string, string> = {
  'Basique': 'bg-green-100 text-green-700',
  'Intermédiaire': 'bg-yellow-100 text-yellow-700',
  'Avancé': 'bg-red-100 text-red-700',
};

export default function TrainingPage() {
  const [activeCategory, setActiveCategory] = useState('Tous');
  const [activeLevel, setActiveLevel] = useState('Tous');
  const [showAI, setShowAI] = useState(false);
  const [selectedModule, setSelectedModule] = useState<number | null>(null);

  const completedCount = TRAINING_MODULES.filter(m => m.completed).length;
  const requiredCount = TRAINING_MODULES.filter(m => m.required).length;
  const completedRequired = TRAINING_MODULES.filter(m => m.required && m.completed).length;
  const overallProgress = Math.round((completedCount / TRAINING_MODULES.length) * 100);
  const avgScore = Math.round(TRAINING_MODULES.filter(m => m.score).reduce((sum, m) => sum + (m.score || 0), 0) / completedCount);

  const filtered = TRAINING_MODULES.filter(m =>
    (activeCategory === 'Tous' || m.category === activeCategory) &&
    (activeLevel === 'Tous' || m.level === activeLevel)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-drc-green text-white">
        <div className="flag-stripe" />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Award className="w-5 h-5 text-drc-yellow" />
                <span className="text-drc-yellow text-sm font-semibold">CDP-AI OS — Académie Politique</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black">Académie Politique Congo D&apos;Abord</h1>
              <p className="text-green-200 text-sm mt-1">Formation des futurs dirigeants congolais — 14 modules certifiants</p>
            </div>
            <button onClick={() => setShowAI(!showAI)} className="hidden md:flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium border border-white/20 transition-all">
              <Brain className="w-4 h-4" /> Agent Formation
            </button>
          </div>

          {/* Progress Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            {[
              { label: 'Modules complétés', value: `${completedCount}/${TRAINING_MODULES.length}` },
              { label: 'Modules obligatoires', value: `${completedRequired}/${requiredCount}` },
              { label: 'Progression globale', value: `${overallProgress}%` },
              { label: 'Score moyen', value: `${avgScore}/100` },
            ].map(stat => (
              <div key={stat.label} className="bg-white/10 rounded-lg p-3 text-center">
                <p className="text-2xl font-black text-drc-yellow">{stat.value}</p>
                <p className="text-green-200 text-xs">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-green-200 mb-1">
              <span>Progression de formation</span>
              <span>{overallProgress}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-3">
              <div className="h-3 bg-drc-yellow rounded-full transition-all" style={{ width: `${overallProgress}%` }} />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters */}
          <div className="lg:col-span-1">
            <div className="card sticky top-24 space-y-4">
              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Catégorie</h4>
                <div className="flex flex-col gap-1">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`text-left px-3 py-2 rounded-lg text-sm transition-all ${
                        activeCategory === cat ? 'bg-drc-green text-white font-semibold' : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Niveau</h4>
                <div className="flex flex-wrap gap-2">
                  {LEVELS.map(level => (
                    <button
                      key={level}
                      onClick={() => setActiveLevel(level)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        activeLevel === level ? 'bg-drc-green text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              {/* Certificate Notice */}
              <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-center gap-2 mb-1">
                  <Award className="w-4 h-4 text-yellow-700" />
                  <p className="text-xs font-bold text-yellow-800">Certificat CDP</p>
                </div>
                <p className="text-xs text-gray-600">
                  Complétez tous les modules obligatoires pour obtenir votre certificat de leadership CDP-AI OS,
                  requis pour les nominations aux postes de niveau provincial et national.
                </p>
              </div>
            </div>
          </div>

          {/* Modules Grid */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-600"><strong>{filtered.length}</strong> modules disponibles</p>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <CheckCircle className="w-3.5 h-3.5 text-drc-green" /> Complété
                <Play className="w-3.5 h-3.5 text-blue-500" /> Disponible
                <Lock className="w-3.5 h-3.5 text-gray-400" /> Bloqué
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.map(module => (
                <div
                  key={module.id}
                  onClick={() => setSelectedModule(selectedModule === module.id ? null : module.id)}
                  className={`card-hover cursor-pointer ${module.completed ? 'border-l-4 border-drc-green' : ''}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {module.completed ? (
                        <div className="w-7 h-7 bg-drc-green rounded-full flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 text-white" />
                        </div>
                      ) : (
                        <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center">
                          <Play className="w-4 h-4 text-blue-600" />
                        </div>
                      )}
                      <span className="text-xs text-gray-400 font-semibold">Module {module.id}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {module.required && <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-semibold">Obligatoire</span>}
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${LEVEL_COLORS[module.level]}`}>{module.level}</span>
                    </div>
                  </div>

                  <h3 className="font-bold text-gray-900 text-sm mb-1">{module.title}</h3>
                  <p className="text-xs text-gray-500 mb-3 leading-relaxed">{module.desc}</p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {module.duration}h</span>
                      <span className="bg-gray-100 px-2 py-0.5 rounded-full">{module.category}</span>
                    </div>
                    {module.score && (
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-500">Score :</span>
                        <span className="text-sm font-black text-drc-green">{module.score}/100</span>
                      </div>
                    )}
                    {!module.completed && (
                      <button className="text-xs font-semibold text-drc-green hover:underline">Commencer →</button>
                    )}
                  </div>

                  {selectedModule === module.id && (
                    <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-gray-50 rounded p-2">
                          <p className="text-gray-500">Durée estimée</p>
                          <p className="font-bold">{module.duration} heures</p>
                        </div>
                        <div className="bg-gray-50 rounded p-2">
                          <p className="text-gray-500">Niveau</p>
                          <p className="font-bold">{module.level}</p>
                        </div>
                        <div className="bg-gray-50 rounded p-2">
                          <p className="text-gray-500">Format</p>
                          <p className="font-bold">Vidéo + Quiz</p>
                        </div>
                        <div className="bg-gray-50 rounded p-2">
                          <p className="text-gray-500">Certificat</p>
                          <p className="font-bold">{module.required ? 'Oui' : 'Non'}</p>
                        </div>
                      </div>
                      {!module.completed && (
                        <button className="w-full btn-primary text-sm flex items-center justify-center gap-2">
                          <Play className="w-4 h-4" /> Commencer ce module
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {showAI && (
              <div className="mt-6">
                <AIAgentPanel
                  agentName="Agent de Formation CDP"
                  agentDescription="Conseille sur les modules de formation et prépare les futurs leaders"
                  placeholderText="Ex: Quels modules dois-je compléter pour devenir président provincial ?"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
