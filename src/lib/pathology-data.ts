
export type PathologyInfo = {
  name: string;
  overview: string;
  clinicalSigns: string;
  symptoms: string;
  referralUrgency: 'Routine' | 'Urgent' | 'Emergency';
};

export type PathologyCategory = {
  title: string;
  conditions: PathologyInfo[];
};

export const pathologyCategories: PathologyCategory[] = [
  {
    title: 'Retinal Conditions',
    conditions: [
      {
        name: 'Age-Related Macular Degeneration (AMD)',
        overview: 'Progressive disease of the macula, common in older adults. Exists in "Dry" (atrophic) and "Wet" (neovascular) forms.',
        clinicalSigns: 'Drusen, pigmentary changes, geographic atrophy. Wet AMD: Subretinal fluid, hemorrhage, or lipid exudates.',
        symptoms: 'Blurred central vision, metamorphopsia (distortion), difficulty reading.',
        referralUrgency: 'Urgent',
      },
      {
        name: 'Diabetic Retinopathy',
        overview: 'Damage to retinal blood vessels caused by prolonged high blood sugar.',
        clinicalSigns: 'Microaneurysms, dot and blot hemorrhages, hard exudates, cotton wool spots. Proliferative stage: Neovascularization.',
        symptoms: 'Often asymptomatic in early stages. Later: Floaters, blurred vision, vision loss.',
        referralUrgency: 'Routine',
      },
      {
        name: 'Retinal Detachment',
        overview: 'Separation of the neurosensory retina from the underlying retinal pigment epithelium.',
        clinicalSigns: 'Grey/opaque appearance of the detached retina, presence of a hole or tear (Rhegmatogenous).',
        symptoms: 'Sudden onset of floaters, flashes of light (photopsia), "curtain" or "shadow" across vision.',
        referralUrgency: 'Emergency',
      }
    ]
  },
  {
    title: 'Glaucoma & Optic Nerve',
    conditions: [
      {
        name: 'Primary Open Angle Glaucoma (POAG)',
        overview: 'Chronic, progressive optic neuropathy with characteristic visual field loss and optic disc changes.',
        clinicalSigns: 'Increased Cup-to-Disc ratio, thinning of the neuroretinal rim, raised IOP (usually), visual field defects.',
        symptoms: 'Asymptomatic until significant peripheral vision loss occurs ("silent thief of sight").',
        referralUrgency: 'Routine',
      },
      {
        name: 'Acute Angle Closure Glaucoma',
        overview: 'Sudden, rapid rise in intraocular pressure due to blockage of the drainage angle.',
        clinicalSigns: 'Very high IOP, ciliary flush, mid-dilated fixed pupil, cloudy cornea.',
        symptoms: 'Severe ocular pain, nausea, vomiting, blurred vision, halos around lights.',
        referralUrgency: 'Emergency',
      }
    ]
  },
  {
    title: 'Anterior Segment',
    conditions: [
      {
        name: 'Cataract',
        overview: 'Opacification of the crystalline lens. Types include Nuclear Sclerotic, Cortical, and Posterior Subcapsular.',
        clinicalSigns: 'Cloudiness of the lens, reduced red reflex, myopic shift in refraction.',
        symptoms: 'Gradual blurring, glare (especially at night), fading of colors.',
        referralUrgency: 'Routine',
      },
      {
        name: 'Keratoconus',
        overview: 'Non-inflammatory thinning and cone-like protrusion of the cornea.',
        clinicalSigns: 'Corneal thinning, Munson\'s sign, Fleischer ring, Vogt\'s striae.',
        symptoms: 'Progressive distortion, high astigmatism, ghosting, frequent Rx changes.',
        referralUrgency: 'Routine',
      }
    ]
  }
];
