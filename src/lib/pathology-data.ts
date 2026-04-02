export type PathologyInfo = {
  name: string;
  overview: string;
  clinicalSigns: string;
  symptoms: string;
  referralUrgency: 'Routine' | 'Urgent' | 'Emergency';
  imageKey: string;
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
        imageKey: 'amd',
      },
      {
        name: 'Diabetic Retinopathy',
        overview: 'Damage to retinal blood vessels caused by prolonged high blood sugar.',
        clinicalSigns: 'Microaneurysms, dot and blot hemorrhages, hard exudates, cotton wool spots. Proliferative stage: Neovascularization.',
        symptoms: 'Often asymptomatic in early stages. Later: Floaters, blurred vision, vision loss.',
        referralUrgency: 'Routine',
        imageKey: 'diabetic_retinopathy',
      },
      {
        name: 'Retinal Detachment',
        overview: 'Separation of the neurosensory retina from the underlying retinal pigment epithelium.',
        clinicalSigns: 'Grey/opaque appearance of the detached retina, presence of a hole or tear (Rhegmatogenous).',
        symptoms: 'Sudden onset of floaters, flashes of light (photopsia), "curtain" or "shadow" across vision.',
        referralUrgency: 'Emergency',
        imageKey: 'retinal_detachment',
      },
      {
        name: 'Retinal Vein Occlusion (RVO)',
        overview: 'Blockage of the retinal veins (Central or Branch), leading to vascular congestion and hemorrhage.',
        clinicalSigns: 'Widespread "blood and thunder" fundus, tortuous veins, macular edema, cotton wool spots.',
        symptoms: 'Sudden, painless blurred vision or vision loss (often in one eye).',
        referralUrgency: 'Urgent',
        imageKey: 'rvo',
      },
      {
        name: 'Retinal Artery Occlusion (RAO)',
        overview: 'Blockage of the retinal arteries (Central or Branch), leading to acute retinal ischemia. This is an eye stroke.',
        clinicalSigns: 'Pale/opaque retina due to edema, "cherry-red spot" at the macula (CRAO), retinal whitening (BRAO).',
        symptoms: 'Sudden, painless, severe vision loss (often in one eye).',
        referralUrgency: 'Emergency',
        imageKey: 'rao',
      },
      {
        name: 'Epiretinal Membrane (ERM)',
        overview: 'A thin, semi-translucent fibrocellular tissue that forms on the inner surface of the retina, specifically at the macula. Also known as "macular pucker".',
        clinicalSigns: 'Glare or sheen from the retinal surface, wrinkling or puckering of the macula, vascular tortuosity.',
        symptoms: 'Metamorphopsia (distortion), blurred central vision, difficulty reading fine detail.',
        referralUrgency: 'Routine',
        imageKey: 'erm',
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
        imageKey: 'poag',
      },
      {
        name: 'Acute Angle Closure Glaucoma',
        overview: 'Sudden, rapid rise in intraocular pressure due to blockage of the drainage angle.',
        clinicalSigns: 'Very high IOP, ciliary flush, mid-dilated fixed pupil, cloudy cornea.',
        symptoms: 'Severe ocular pain, nausea, vomiting, blurred vision, halos around lights.',
        referralUrgency: 'Emergency',
        imageKey: 'aacg',
      },
      {
        name: 'Papilledema',
        overview: 'Swelling of the optic disc caused by increased intracranial pressure. This is a medical emergency requiring urgent investigation.',
        clinicalSigns: 'Blurred disc margins, hyperemic disc, splinter hemorrhages, absence of spontaneous venous pulsation (SVP).',
        symptoms: 'Headache (worse on waking/straining), nausea, vomiting, transient visual obscurations.',
        referralUrgency: 'Emergency',
        imageKey: 'papilledema',
      },
      {
        name: 'Optic Neuritis',
        overview: 'Inflammation of the optic nerve, frequently the first presenting sign of Multiple Sclerosis.',
        clinicalSigns: 'Relative Afferent Pupillary Defect (RAPD), swollen or normal disc (Retrobulbar), red-green color deficiency.',
        symptoms: 'Sudden, unilateral vision loss, pain on eye movement, "washed-out" colors.',
        referralUrgency: 'Urgent',
        imageKey: 'optic_neuritis',
      }
    ]
  },
  {
    title: 'Anterior Segment & Uveitis',
    conditions: [
      {
        name: 'Cataract',
        overview: 'Opacification of the crystalline lens. Types include Nuclear Sclerotic, Cortical, and Posterior Subcapsular.',
        clinicalSigns: 'Cloudiness of the lens, reduced red reflex, myopic shift in refraction.',
        symptoms: 'Gradual blurring, glare (especially at night), fading of colors.',
        referralUrgency: 'Routine',
        imageKey: 'cataract',
      },
      {
        name: 'Keratoconus',
        overview: 'Non-inflammatory thinning and cone-like protrusion of the cornea.',
        clinicalSigns: 'Corneal thinning, Munson\'s sign, Fleischer ring, Vogt\'s striae.',
        symptoms: 'Progressive distortion, high astigmatism, ghosting, frequent Rx changes.',
        referralUrgency: 'Routine',
        imageKey: 'keratoconus',
      },
      {
        name: 'Anterior Uveitis',
        overview: 'Inflammation of the iris and ciliary body. Often associated with HLA-B27 systemic conditions.',
        clinicalSigns: 'Ciliary flush, cells and flare in the anterior chamber, keratic precipitates (KPs), miosis (small pupil).',
        symptoms: 'Dull aching pain, photophobia (light sensitivity), redness, blurred vision.',
        referralUrgency: 'Urgent',
        imageKey: 'uveitis',
      },
      {
        name: 'Corneal Ulcer',
        overview: 'A serious infection of the cornea, often associated with contact lens wear. Requires immediate ophthalmic assessment.',
        clinicalSigns: 'White/creamy infiltrate, epithelial defect, hypopyon in severe cases, ciliary flush.',
        symptoms: 'Severe ocular pain, redness, photophobia, blurred vision.',
        referralUrgency: 'Emergency',
        imageKey: 'corneal_ulcer',
      },
      {
        name: 'Scleritis',
        overview: 'Severe, destructive inflammation of the sclera, often associated with underlying systemic autoimmune diseases.',
        clinicalSigns: 'Deep-red or violaceous (purple) hue of the sclera, scleral edema, non-blanching vessels with phenylephrine.',
        symptoms: 'Intense, "boring" ocular pain (often radiating to the forehead), tenderness, photophobia.',
        referralUrgency: 'Urgent',
        imageKey: 'scleritis',
      },
      {
        name: 'Subconjunctival Haemorrhage',
        overview: 'A benign, painless collection of blood under the conjunctiva, often occurring spontaneously or after straining.',
        clinicalSigns: 'Bright red patch on the sclera with sharp borders. The rest of the conjunctiva is quiet.',
        symptoms: 'Often asymptomatic. Patient may notice a "bloody eye" in the mirror. No vision loss.',
        referralUrgency: 'Routine',
        imageKey: 'subconj_haemorrhage',
      }
    ]
  }
];
