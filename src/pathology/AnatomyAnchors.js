import * as THREE from 'three';

/**
 * Map each pathology to anatomical mesh name patterns in the Z-Anatomy GLB.
 * After load, hotspot/label positions are snapped to real mesh centers.
 */
export const ANCHOR_MAP = {
  neck_cervical_herniation: {
    match: [/cervical vertebr/i],
    side: 'center',
    pick: 'mid',
  },
  neck_straightening: {
    match: [/^trapezius$/i, /trapezius/i, /levator scapulae/i],
    side: 'center',
    pick: 'highest',
  },
  shoulder_impingement: {
    match: [/supraspinatus/i],
    side: 'right',
  },
  shoulder_pectoralis_strain: {
    match: [/pectoralis major/i],
    side: 'right',
    pick: 'frontmost',
  },
  shoulder_frozen_shoulder: {
    match: [/deltoid/i, /subscapularis/i, /infraspinatus/i],
    side: 'right',
    pick: 'highest',
  },
  elbow_lateral_epicondylitis: {
    match: [/extensor carpi ulnaris/i, /extensor digitorum/i, /humerus/i],
    side: 'right',
    pick: 'lowest',
  },
  elbow_medial_epicondylitis: {
    match: [/flexor carpi ulnaris/i, /flexor digitorum/i, /humerus/i],
    side: 'right',
    pick: 'lowest',
  },
  wrist_carpal_tunnel: {
    match: [/flexor digitorum superficialis/i, /flexor pollicis longus/i, /metacarpal/i],
    side: 'right',
    pick: 'lowest',
  },
  wrist_de_quervain: {
    match: [/abductor pollicis longus/i, /extensor pollicis/i],
    side: 'right',
  },
  lumbar_disc_herniation: {
    match: [/lumbar vertebr/i],
    side: 'center',
    pick: 'mid',
  },
  pelvis_piriformis_syndrome: {
    match: [/piriform/i, /gluteus maximus/i],
    side: 'right',
  },
  hip_fai_impingement: {
    match: [/iliacus/i, /gluteus medius/i, /^femur$/i],
    side: 'right',
    pick: 'highest',
  },
  hip_trochanteric_bursitis: {
    match: [/trochanteric bursa/i, /gluteus medius/i],
    side: 'right',
  },
  knee_acl_tear: {
    match: [/^patella$/i, /quadriceps femoris/i],
    side: 'right',
  },
  knee_patellofemoral_syndrome: {
    match: [/^patella$/i],
    side: 'right',
  },
  knee_meniscus_tear: {
    match: [/^patella$/i, /medial subtendinous bursa of gastrocnemius/i],
    side: 'right',
    offset: { x: 0.15, y: -0.15, z: 0.05 },
  },
  ankle_sprain_atfl: {
    match: [/talus bone/i, /^fibula$/i],
    side: 'right',
    pick: 'lowest',
  },
  ankle_achilles_tendinopathy: {
    match: [/^calcaneus$/i, /gastrocnemius/i],
    side: 'right',
    pick: 'lowest',
    offset: { x: 0, y: 0.35, z: -0.15 },
  },
  foot_plantar_fasciitis: {
    match: [/plantar tendon sheath/i, /^calcaneus$/i, /phalanx/i],
    side: 'right',
    pick: 'lowest',
  },
  back_latissimus_strain: {
    match: [/latissimus dorsi/i],
    side: 'right',
  },
  back_rhomboid_strain: {
    match: [/rhomboid/i],
    side: 'right',
  },
  thoracic_facet_syndrome: {
    match: [/thoracic vertebr/i, /erector spinae/i],
    side: 'center',
    pick: 'mid',
  },
  neck_trapezius_myalgia: {
    match: [/^trapezius$/i, /trapezius/i],
    side: 'right',
    pick: 'highest',
  },
  lumbar_muscle_strain: {
    match: [/erector spinae/i, /multifidus/i, /lumbar vertebr/i],
    side: 'center',
    pick: 'mid',
  },
  shoulder_biceps_tendinopathy: {
    match: [/biceps brachii/i, /biceps/i],
    side: 'right',
    pick: 'highest',
  },
  wrist_tfcc: {
    match: [/ulna/i, /extensor carpi ulnaris/i, /metacarpal/i],
    side: 'right',
    pick: 'lowest',
  },
  pelvis_si_joint: {
    match: [/sacrum/i, /ilium/i, /gluteus maximus/i],
    side: 'right',
    pick: 'highest',
  },
  hip_itband_syndrome: {
    match: [/tensor fasciae latae/i, /gluteus medius/i, /^femur$/i],
    side: 'right',
    pick: 'mid',
  },
  thigh_hamstring_strain: {
    match: [/biceps femoris/i, /semitendinosus/i, /semimembranosus/i],
    side: 'right',
  },
  knee_mcl_sprain: {
    match: [/^patella$/i, /vastus medialis/i],
    side: 'right',
    offset: { x: -0.12, y: 0, z: 0.05 },
  },
  shin_mtss: {
    match: [/^tibia$/i, /tibialis posterior/i, /soleus/i],
    side: 'right',
    pick: 'lowest',
  },
  calf_gastrocnemius_strain: {
    match: [/gastrocnemius/i],
    side: 'right',
    pick: 'lowest',
  },
  shoulder_rotator_cuff_tear: {
    match: [/supraspinatus/i, /infraspinatus/i],
    side: 'right',
  },
  shoulder_ac_joint_sprain: {
    match: [/clavicle/i, /acromion/i, /deltoid/i],
    side: 'right',
    pick: 'highest',
  },
  shoulder_scapular_dyskinesis: {
    match: [/serratus anterior/i, /trapezius/i, /scapula/i],
    side: 'right',
  },
  elbow_olecranon_bursitis: {
    match: [/olecranon/i, /triceps brachii/i, /ulna/i],
    side: 'right',
    pick: 'lowest',
  },
  wrist_trigger_finger: {
    match: [/flexor digitorum superficialis/i, /flexor digitorum/i, /metacarpal/i],
    side: 'right',
    pick: 'lowest',
  },
  neck_whiplash_strain: {
    match: [/sternocleidomastoid/i, /trapezius/i, /cervical vertebr/i],
    side: 'center',
    pick: 'highest',
  },
  lumbar_facet_syndrome: {
    match: [/lumbar vertebr/i, /multifidus/i],
    side: 'right',
    pick: 'mid',
  },
  abdomen_rectus_strain: {
    match: [/rectus abdominis/i],
    side: 'center',
    pick: 'frontmost',
  },
  knee_patellar_tendinopathy: {
    match: [/^patella$/i, /quadriceps femoris/i],
    side: 'right',
    pick: 'lowest',
    offset: { x: 0, y: -0.2, z: 0.12 },
  },
  hip_adductor_strain: {
    match: [/adductor longus/i, /adductor/i, /gracilis/i],
    side: 'right',
    pick: 'frontmost',
  },
  ankle_peroneal_tendinopathy: {
    match: [/fibularis longus/i, /peroneus/i, /^fibula$/i],
    side: 'right',
    pick: 'lowest',
  },
  foot_morton_neuroma: {
    match: [/metatarsal/i, /phalanx/i, /^calcaneus$/i],
    side: 'right',
    pick: 'lowest',
    offset: { x: 0, y: 0.05, z: 0.2 },
  },
  chest_costochondritis: {
    match: [/sternum/i, /rib/i, /pectoralis major/i],
    side: 'right',
    pick: 'frontmost',
  },
  ankle_achilles_rupture: {
    match: [/^calcaneus$/i, /gastrocnemius/i, /soleus/i],
    side: 'right',
    pick: 'lowest',
    offset: { x: 0, y: 0.25, z: -0.2 },
  },
  lumbar_cauda_equina: {
    match: [/lumbar vertebr/i, /sacrum/i],
    side: 'center',
    pick: 'lowest',
  },
};

function meshLabel(mesh) {
  return `${mesh.userData?.name || ''} ${mesh.name || ''}`.trim();
}

function meshCenterWorld(mesh, target = new THREE.Vector3()) {
  if (!mesh.geometry.boundingBox) {
    mesh.geometry.computeBoundingBox();
  }
  const box = mesh.geometry.boundingBox.clone();
  box.applyMatrix4(mesh.matrixWorld);
  return box.getCenter(target);
}

function filterBySide(candidates, side) {
  if (side === 'right') return candidates.filter((c) => c.pos.x >= 0);
  if (side === 'left') return candidates.filter((c) => c.pos.x <= 0);
  return candidates;
}

function pickCandidate(list, pick) {
  if (!list.length) return null;
  if (pick === 'highest') return list.reduce((a, b) => (a.pos.y >= b.pos.y ? a : b));
  if (pick === 'lowest') return list.reduce((a, b) => (a.pos.y <= b.pos.y ? a : b));
  if (pick === 'frontmost') return list.reduce((a, b) => (a.pos.z >= b.pos.z ? a : b));
  // mid: closest to average Y
  const avgY = list.reduce((s, c) => s + c.pos.y, 0) / list.length;
  return list.reduce((a, b) =>
    Math.abs(a.pos.y - avgY) <= Math.abs(b.pos.y - avgY) ? a : b
  );
}

/**
 * Find world-space anchor + related meshes for one pathology.
 * @returns {{ position: THREE.Vector3, meshes: THREE.Mesh[] } | null}
 */
export function resolveAnchor(modelGroup, pathologyId) {
  const spec = ANCHOR_MAP[pathologyId];
  if (!spec || !modelGroup) return null;

  modelGroup.updateMatrixWorld(true);

  for (const pattern of spec.match) {
    const candidates = [];
    modelGroup.traverse((child) => {
      if (!child.isMesh || !child.visible) return;
      const label = meshLabel(child);
      if (!pattern.test(label) && !pattern.test(child.name)) return;
      const pos = meshCenterWorld(child);
      candidates.push({ mesh: child, pos: pos.clone(), label });
    });

    const sided = filterBySide(candidates, spec.side);
    const pool = sided.length ? sided : candidates;
    const chosen = pickCandidate(pool, spec.pick || 'mid');
    if (chosen) {
      const out = chosen.pos.clone();
      if (spec.offset) {
        out.x += spec.offset.x || 0;
        out.y += spec.offset.y || 0;
        out.z += spec.offset.z || 0;
      }
      // Glow: primary mesh + nearby siblings from same pattern (max 5)
      const meshes = pool
        .slice()
        .sort((a, b) => a.pos.distanceTo(chosen.pos) - b.pos.distanceTo(chosen.pos))
        .slice(0, 5)
        .map((c) => c.mesh);
      return { position: out, meshes };
    }
  }

  return null;
}

/**
 * Snap all pathology hotspot + camera targets onto anatomy meshes.
 * Stores p.anchorMeshes for hover highlight.
 * Hotspots sit on mesh centers (tiny surface bias only — no floating).
 */
export function bindPathologiesToAnatomy(modelGroup, pathologies) {
  let bound = 0;

  pathologies.forEach((p) => {
    const result = resolveAnchor(modelGroup, p.id);
    if (!result) {
      console.warn(`Anatomy anchor bulunamadı: ${p.id}`);
      p.anchorMeshes = [];
      return;
    }

    const { position: pos, meshes } = result;

    // Subtle lift toward exterior so the dot sits on the surface, not deep inside.
    // Keep this tiny — large offsets make markers float in empty space.
    const radial = new THREE.Vector3(pos.x, 0, pos.z);
    if (radial.lengthSq() < 0.01) {
      radial.set(0, 0, 1);
    } else {
      radial.normalize();
    }
    const surface = pos.clone().addScaledVector(radial, 0.12);

    p.hotspotCoordinates = { x: surface.x, y: surface.y, z: surface.z };
    p.focusPoint = { x: pos.x, y: pos.y, z: pos.z };
    p.anchorMeshes = meshes;

    // Camera stands outside — used if animateToFocus isn't available
    const view = new THREE.Vector3(pos.x * 0.22, 0.1, pos.z < -0.25 ? -1 : 1).normalize();
    const cam = pos.clone().addScaledVector(view, 10);
    cam.y = Math.max(cam.y, pos.y + 0.5);
    p.cameraTarget = { x: cam.x, y: cam.y, z: cam.z };

    bound++;
  });

  console.log(`✅ Anatomi entegrasyonu: ${bound}/${pathologies.length} hotspot bağlandı`);
  return bound;
}
