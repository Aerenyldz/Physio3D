import { PATHOLOGIES_DATABASE, getAllRegions } from './pathologiesData.js';

(function(){
    'use strict';

    // Patoloji Verisi ve Erken Teşhis Metin İşleme
    var PATHOLOGIES = PATHOLOGIES_DATABASE.map(function(item) {
        var warningText = "";
        if (item.severity === "Kritik") {
            warningText = "🚨 Acil Uzman Hekim/Ortopedi Muayenesi ve Radyolojik İnceleme (MRI/BT) Gereklidir.";
        } else if (item.severity === "Yüksek") {
            warningText = "🚨 Fizyoterapist Değerlendirmesi Önerilir. Erken Teşhis İlerlemenin Önüne Geçer.";
        } else {
            warningText = "⚠️ Klinik Değerlendirme ve Postüral Düzenleme Önerilir.";
        }

        var exerciseText = item.rehabFocus ? "🏋️ " + item.rehabFocus.join(", ") : "Egzersiz protokolü hazırlanıyor.";

        return Object.assign({}, item, {
            earlyWarning: warningText,
            exerciseRecommendation: exerciseText
        });
    });

    // Three.js Sahne
    var container = document.getElementById('canvas-container');
    var scene = new THREE.Scene();
    scene.background = new THREE.Color(0x080c18);
    scene.fog = new THREE.FogExp2(0x080c18, 0.015);

    var camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 200);
    var defaultCameraPos = new THREE.Vector3(0, 7.5, 18);
    var defaultControlsTarget = new THREE.Vector3(0, 7.5, 0);
    camera.position.copy(defaultCameraPos);

    var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);

    var controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.maxDistance = 35;
    controls.minDistance = 3;
    controls.target.copy(defaultControlsTarget);
    controls.maxPolarAngle = Math.PI / 2 + 0.15;

    // Aydınlatma
    scene.add(new THREE.AmbientLight(0x1a1a2e, 0.6));
    var hemiLight = new THREE.HemisphereLight(0xc4d7ff, 0x2a2a3e, 0.6);
    hemiLight.position.set(0, 20, 0);
    scene.add(hemiLight);

    var keyLight = new THREE.DirectionalLight(0xfaf0e6, 1.0);
    keyLight.position.set(5, 15, 8);
    keyLight.castShadow = true;
    scene.add(keyLight);

    var rimLight1 = new THREE.PointLight(0x38bdf8, 3.0, 40);
    rimLight1.position.set(-8, 10, -6);
    scene.add(rimLight1);

    var rimLight2 = new THREE.PointLight(0xef4444, 2.0, 30);
    rimLight2.position.set(8, 10, -4);
    scene.add(rimLight2);

    // Zemin
    var floor = new THREE.Mesh(
        new THREE.PlaneGeometry(100, 100),
        new THREE.MeshStandardMaterial({ color: 0x0a0e1a, roughness: 0.2, metalness: 0.8 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    var gridHelper = new THREE.GridHelper(50, 50, 0x1e2945, 0x111828);
    gridHelper.position.y = 0.01;
    scene.add(gridHelper);

    // Parçacıklar
    var particleCount = 250;
    var particleGeo = new THREE.BufferGeometry();
    var particlePositions = new Float32Array(particleCount * 3);
    for(var i = 0; i < particleCount; i++){
        particlePositions[i*3] = (Math.random() - 0.5) * 40;
        particlePositions[i*3+1] = Math.random() * 20;
        particlePositions[i*3+2] = (Math.random() - 0.5) * 40;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    var particles = new THREE.Points(particleGeo, new THREE.PointsMaterial({
        color: 0x38bdf8, size: 0.05, transparent: true, opacity: 0.4, blending: THREE.AdditiveBlending
    }));
    scene.add(particles);

    // MODEL GRUBU
    var modelGroup = new THREE.Group();
    scene.add(modelGroup);

    // Tam 3D Anatomi & Kas Gövdesi Çizim Fonksiyonu
    function createFullAnatomicalBody() {
        var boneMat = new THREE.MeshStandardMaterial({ color: 0xe2d7c5, roughness: 0.4, metalness: 0.1 });
        var muscleMat = new THREE.MeshStandardMaterial({ color: 0x8b3a3a, roughness: 0.6, metalness: 0.1, transparent: true, opacity: 0.85 });
        var jointMat = new THREE.MeshStandardMaterial({ color: 0xc8b8a2, roughness: 0.3 });

        var body = new THREE.Group();

        // Baş & Boyun
        var skull = new THREE.Mesh(new THREE.SphereGeometry(0.85, 32, 32), boneMat);
        skull.scale.set(1, 1.15, 1.05); skull.position.set(0, 15.4, 0); body.add(skull);
        var neck = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.4, 1.0, 16), muscleMat);
        neck.position.set(0, 14.3, -0.1); body.add(neck);

        // Omurga
        for(var i = 0; i < 20; i++) {
            var vert = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.25, 0.25, 12), boneMat);
            vert.position.set(0, 7.8 + i * 0.32, -0.3);
            body.add(vert);
        }

        // Göğüs Kafesi & Göğüs Kasları
        var ribcage = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.2, 3.2, 24), muscleMat);
        ribcage.position.set(0, 12.2, 0.1); body.add(ribcage);

        var pecL = new THREE.Mesh(new THREE.SphereGeometry(0.8, 16, 16), muscleMat);
        pecL.scale.set(1.4, 0.8, 0.5); pecL.position.set(1.1, 12.5, 0.7); body.add(pecL);
        var pecR = pecL.clone(); pecR.position.set(-1.1, 12.5, 0.7); body.add(pecR);

        // Omuzlar
        var shoulderL = new THREE.Mesh(new THREE.SphereGeometry(0.7, 16, 16), muscleMat);
        shoulderL.position.set(3.2, 13.2, 0); body.add(shoulderL);
        var shoulderR = shoulderL.clone(); shoulderR.position.set(-3.2, 13.2, 0); body.add(shoulderR);

        // Kollar, Dirsekler ve Ön Kollar
        var armL = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.35, 3.2, 16), muscleMat);
        armL.position.set(4.3, 11.3, 0.1); armL.rotation.z = -0.25; body.add(armL);
        var elbowL = new THREE.Mesh(new THREE.SphereGeometry(0.4, 16, 16), jointMat);
        elbowL.position.set(5.5, 9.5, 0.1); body.add(elbowL);
        var forearmL = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.25, 2.8, 16), muscleMat);
        forearmL.position.set(6.4, 8.1, 0.2); forearmL.rotation.z = -0.3; body.add(forearmL);
        var handL = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.8, 0.5), boneMat);
        handL.position.set(7.2, 6.6, 0.2); body.add(handL);

        var armR = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.35, 3.2, 16), muscleMat);
        armR.position.set(-4.3, 11.3, 0.1); armR.rotation.z = 0.25; body.add(armR);
        var elbowR = new THREE.Mesh(new THREE.SphereGeometry(0.4, 16, 16), jointMat);
        elbowR.position.set(-5.5, 9.5, 0.1); body.add(elbowR);
        var forearmR = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.25, 2.8, 16), muscleMat);
        forearmR.position.set(-6.4, 8.1, 0.2); forearmR.rotation.z = 0.3; body.add(forearmR);
        var handR = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.8, 0.5), boneMat);
        handR.position.set(-7.2, 6.6, 0.2); body.add(handR);

        // Pelvis & Kalça
        var pelvis = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.1, 1.6, 24), boneMat);
        pelvis.position.set(0, 8.2, 0); body.add(pelvis);
        var gluteL = new THREE.Mesh(new THREE.SphereGeometry(0.9, 16, 16), muscleMat);
        gluteL.position.set(1.2, 8.2, -0.4); body.add(gluteL);
        var gluteR = gluteL.clone(); gluteR.position.set(-1.2, 8.2, -0.4); body.add(gluteR);

        // Bacaklar & Dizler
        var thighL = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.45, 3.6, 16), muscleMat);
        thighL.position.set(1.6, 6.3, 0.1); body.add(thighL);
        var thighR = thighL.clone(); thighR.position.set(-1.6, 6.3, 0.1); body.add(thighR);

        var kneeL = new THREE.Mesh(new THREE.SphereGeometry(0.45, 16, 16), jointMat);
        kneeL.position.set(1.6, 4.5, 0.3); body.add(kneeL);
        var kneeR = kneeL.clone(); kneeR.position.set(-1.6, 4.5, 0.3); body.add(kneeR);

        var calfL = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.3, 3.2, 16), muscleMat);
        calfL.position.set(1.6, 2.8, 0.1); body.add(calfL);
        var calfR = calfL.clone(); calfR.position.set(-1.6, 2.8, 0.1); body.add(calfR);

        // Ayak Bileği & Ayaklar
        var ankleL = new THREE.Mesh(new THREE.SphereGeometry(0.35, 16, 16), jointMat);
        ankleL.position.set(1.6, 1.2, 0.0); body.add(ankleL);
        var ankleR = ankleL.clone(); ankleR.position.set(-1.6, 1.2, 0.0); body.add(ankleR);

        var footL = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.35, 1.4), boneMat);
        footL.position.set(1.6, 0.2, 0.4); body.add(footL);
        var footR = footL.clone(); footR.position.set(-1.6, 0.2, 0.4); body.add(footR);

        modelGroup.add(body);
    }

    // GLTF Yükleme veya Prosedürel Gövde Çizme
    if (typeof THREE.GLTFLoader !== 'undefined') {
        var loader = new THREE.GLTFLoader();
        loader.load(
            'assets/models/muscular_skeleton.glb',
            function (gltf) {
                var model = gltf.scene;
                model.scale.set(1.0, 1.0, 1.0);
                model.position.set(0, 0, 0);
                modelGroup.add(model);
                dismissLoader();
            },
            function (xhr) {
                if (xhr.lengthComputable) {
                    var percent = (xhr.loaded / xhr.total) * 100;
                    var fill = document.getElementById('loader-progress');
                    if (fill) fill.style.width = percent + '%';
                }
            },
            function (err) {
                console.warn('GLB yüklenemedi. Detaylı 3D Kas-İskelet Modeli oluşturuluyor...');
                createFullAnatomicalBody();
                dismissLoader();
            }
        );
    } else {
        createFullAnatomicalBody();
        dismissLoader();
    }

    function dismissLoader(){
        var loaderEl = document.getElementById('loader');
        if(loaderEl) {
            if(typeof gsap !== 'undefined'){
                gsap.to(loaderEl, { opacity: 0, duration: 0.5, onComplete: function(){ loaderEl.style.display = 'none'; } });
            } else {
                loaderEl.style.display = 'none';
            }
        }
    }

    setTimeout(dismissLoader, 2000);

    // PAIN MARKERS (Noktalar)
    var interactableObjects = [];
    var painMarkers = [];
    var activeFilter = { region: 'all', severity: 'all', category: 'all' };

    var severityColors = {
        'Düşük':  { core: 0x22c55e, halo: 0x4ade80 },
        'Orta':   { core: 0xf59e0b, halo: 0xfbbf24 },
        'Yüksek': { core: 0xef4444, halo: 0xf87171 },
        'Kritik': { core: 0xdc2626, halo: 0xff0000 }
    };

    function createPainMarker(pathology){
        var pos = pathology.hotspotCoordinates;
        var colors = severityColors[pathology.severity] || severityColors['Orta'];

        var group = new THREE.Group();
        group.position.set(pos.x, pos.y, pos.z);

        var core = new THREE.Mesh(new THREE.SphereGeometry(0.14, 16, 16), new THREE.MeshBasicMaterial({ color: colors.core }));
        core.userData = { id: pathology.id };

        var halo = new THREE.Mesh(new THREE.SphereGeometry(0.3, 16, 16), new THREE.MeshBasicMaterial({ color: colors.halo, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending }));
        halo.userData = { id: pathology.id };

        var ring = new THREE.Mesh(new THREE.RingGeometry(0.35, 0.42, 32), new THREE.MeshBasicMaterial({ color: colors.core, transparent: true, opacity: 0.3, side: THREE.DoubleSide, blending: THREE.AdditiveBlending }));
        ring.userData = { id: pathology.id };

        group.add(core); group.add(halo); group.add(ring);
        scene.add(group);

        interactableObjects.push(core, halo);
        createHTMLLabel(pathology);
        painMarkers.push({ group: group, core: core, halo: halo, ring: ring, id: pathology.id, pathology: pathology });
    }

    function createHTMLLabel(pathology){
        var container = document.getElementById('labels-container');
        var el = document.createElement('div');
        el.id = 'label-' + pathology.id;
        el.className = 'label-element';

        var sevClass = { 'Düşük': 'sev-low', 'Orta': 'sev-medium', 'Yüksek': 'sev-high', 'Kritik': 'sev-critical' }[pathology.severity] || 'sev-medium';
        el.classList.add(sevClass);

        el.innerHTML =
            '<div class="label-inner">' +
                '<span class="label-dot"><span class="label-ping"></span><span class="label-core"></span></span>' +
                '<span class="label-text">' + pathology.title.split('(')[0].trim() + '</span>' +
            '</div>';

        el.addEventListener('click', function(e){ e.stopPropagation(); triggerPointAction(pathology.id); });
        container.appendChild(el);
    }

    PATHOLOGIES.forEach(function(p){ createPainMarker(p); });

    // Filtreler
    var regions = getAllRegions();
    var regionContainer = document.getElementById('region-filters');
    if (regionContainer) {
        regions.forEach(function(r){
            var btn = document.createElement('button');
            btn.className = 'filter-btn'; btn.dataset.filter = r; btn.dataset.type = 'region'; btn.textContent = r;
            regionContainer.appendChild(btn);
        });
    }

    document.querySelectorAll('.filter-btn').forEach(function(btn){
        btn.addEventListener('click', function(){
            var type = btn.dataset.type; var value = btn.dataset.filter;
            var group = btn.closest('.filter-buttons');
            group.querySelectorAll('.filter-btn').forEach(function(b){ b.classList.remove('active'); });
            btn.classList.add('active');
            activeFilter[type] = value;
            applyFilters();
        });
    });

    function applyFilters(){
        var visibleCount = 0;
        PATHOLOGIES.forEach(function(p){
            var matchRegion = activeFilter.region === 'all' || p.region === activeFilter.region;
            var matchSeverity = activeFilter.severity === 'all' || p.severity === activeFilter.severity;
            var matchCategory = activeFilter.category === 'all' || p.category === activeFilter.category;
            var visible = matchRegion && matchSeverity && matchCategory;

            var marker = painMarkers.find(function(m){ return m.id === p.id; });
            var label = document.getElementById('label-' + p.id);
            if(marker) marker.group.visible = visible;
            if(label) label.style.display = visible ? '' : 'none';
            if(visible) visibleCount++;
        });
        document.getElementById('visible-count').textContent = visibleCount;
    }

    // Tıklama & Raycaster
    var raycaster = new THREE.Raycaster();
    var mouse = new THREE.Vector2();

    window.addEventListener('mousemove', function(e){
        mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        var intersects = raycaster.intersectObjects(interactableObjects);
        document.body.style.cursor = intersects.length > 0 ? 'pointer' : 'default';
    });

    renderer.domElement.addEventListener('click', function(e){
        mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        var intersects = raycaster.intersectObjects(interactableObjects);
        if(intersects.length > 0){
            var id = intersects[0].object.userData.id;
            if(id) triggerPointAction(id);
        }
    });

    function triggerPointAction(id){
        var pathology = PATHOLOGIES.find(function(p){ return p.id === id; });
        if(!pathology) return;

        var targetPos = new THREE.Vector3(pathology.cameraTarget.x, pathology.cameraTarget.y, pathology.cameraTarget.z);
        var lookAt = new THREE.Vector3(pathology.hotspotCoordinates.x, pathology.hotspotCoordinates.y, pathology.hotspotCoordinates.z);

        if(typeof gsap !== 'undefined'){
            gsap.to(camera.position, { x: targetPos.x, y: targetPos.y, z: targetPos.z, duration: 1.2, ease: "power3.inOut", onUpdate: function(){ camera.lookAt(lookAt); } });
            gsap.to(controls.target, { x: lookAt.x, y: lookAt.y, z: lookAt.z, duration: 1.2, ease: "power3.inOut" });
        } else {
            camera.position.copy(targetPos); controls.target.copy(lookAt);
        }

        updateInfoPanel(pathology);
        showInfoPanel();
    }

    function updateInfoPanel(p){
        document.getElementById('panel-region').textContent = p.region;
        document.getElementById('panel-title').textContent = p.title;
        document.getElementById('panel-latin').textContent = p.latinName;
        document.getElementById('panel-desc').textContent = p.description;

        document.getElementById('panel-early-warning').textContent = p.earlyWarning;
        document.getElementById('panel-exercise').textContent = p.exerciseRecommendation;

        var sevBadge = document.getElementById('panel-severity');
        var sevKey = p.severity.toLowerCase().replace(/ü/g,'u').replace(/ş/g,'s').replace(/ı/g,'i');
        sevBadge.className = 'panel-severity-badge sev-badge-' + sevKey;
        document.getElementById('panel-severity-text').textContent = p.severity;

        document.getElementById('panel-category').querySelector('span').textContent = p.category;

        fillList('panel-symptoms', p.symptoms);
        fillList('panel-structures', p.affectedStructures);
        fillList('panel-movements', p.aggravatingMovements);
        fillList('panel-rehab', p.rehabFocus);
    }

    function fillList(elId, items){
        var ul = document.getElementById(elId); if(!ul) return; ul.innerHTML = '';
        if(items) {
            items.forEach(function(s){ var li = document.createElement('li'); li.textContent = s; ul.appendChild(li); });
        }
    }

    function showInfoPanel(){
        var panel = document.getElementById('info-panel');
        panel.style.visibility = 'visible';
        if(typeof gsap !== 'undefined'){ gsap.to(panel, { opacity: 1, x: 0, scale: 1, duration: 0.4, ease: "back.out(1.2)" }); }
        else { panel.style.opacity = '1'; }
    }

    function resetView(){
        var panel = document.getElementById('info-panel');
        if(typeof gsap !== 'undefined'){
            gsap.to(panel, { opacity: 0, x: -30, duration: 0.3, onComplete: function(){ panel.style.visibility = 'hidden'; } });
            gsap.to(camera.position, { x: defaultCameraPos.x, y: defaultCameraPos.y, z: defaultCameraPos.z, duration: 1.2 });
            gsap.to(controls.target, { x: defaultControlsTarget.x, y: defaultControlsTarget.y, z: defaultControlsTarget.z, duration: 1.2 });
        } else {
            panel.style.visibility = 'hidden'; camera.position.copy(defaultCameraPos); controls.target.copy(defaultControlsTarget);
        }
    }

    document.getElementById('btn-reset').addEventListener('click', resetView);
    document.getElementById('panel-close').addEventListener('click', resetView);

    // Etiket Pozisyon Güncelleme
    var tempVector = new THREE.Vector3();
    function updateLabels(){
        painMarkers.forEach(function(marker){
            var label = document.getElementById('label-' + marker.id);
            if(!label) return;
            if(!marker.group.visible) { label.style.opacity = '0'; label.style.pointerEvents = 'none'; return; }

            tempVector.copy(marker.group.position);
            tempVector.project(camera);

            var x = (tempVector.x * 0.5 + 0.5) * window.innerWidth;
            var y = (-tempVector.y * 0.5 + 0.5) * window.innerHeight;
            var isBehind = tempVector.z > 1;

            if(isBehind){
                label.style.opacity = '0'; label.style.pointerEvents = 'none';
            } else {
                label.style.opacity = '1'; label.style.pointerEvents = 'auto'; label.style.left = x + 'px'; label.style.top = y + 'px';
            }
        });
    }

    // Animasyon Döngüsü
    var clock = new THREE.Clock();
    function animate(){
        requestAnimationFrame(animate);
        var elapsed = clock.getElapsedTime();

        painMarkers.forEach(function(m, i){
            var pulse = Math.sin(elapsed * 2.5 + i * 0.7) * 0.08 + 1.0;
            m.halo.scale.set(pulse, pulse, pulse);
            m.ring.lookAt(camera.position);
        });

        controls.update();
        updateLabels();
        renderer.render(scene, camera);
    }

    window.addEventListener('resize', function(){
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    animate();
})();