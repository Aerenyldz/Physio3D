// Physio3D Pro - Kapsamlı Tüm Vücut Patoloji Veritabanı (pathologiesData.js)
// 19 patoloji, 8 vücut bölgesi

export const PATHOLOGIES_DATABASE = [
  // ═══════════════════════════════════════════════════════════════
  // A. BAŞ & BOYUN BÖLGESİ (Head & Neck Region)
  // ═══════════════════════════════════════════════════════════════
  {
    id: "neck_cervical_herniation",
    region: "Boyun",
    title: "Servikal Disk Hernisi (Boyun Fıtığı)",
    latinName: "Hernia Disci Cervicalis (C5-C7)",
    hotspotCoordinates: { x: 0.0, y: 14.5, z: -0.2 },
    cameraTarget: { x: 0.0, y: 14.5, z: 2.5 },
    severity: "Yüksek",
    category: "Omurga-Sinir",
    description: "Omurlar arasındaki kıkırdak diskin dışarı taşarak kollara giden sinir köklerine baskı yapması durumudur. Boyundan kola uzanan şiddetli ağrı ve uyuşma ile karakterizedir.",
    symptoms: [
      "Boyundan kola yayılan keskin ağrı",
      "Parmaklarda uyuşma ve karıncalanma",
      "Belirgin kas güçsüzlüğü",
      "Boyun hareketlerinde kısıtlılık"
    ],
    affectedStructures: ["C5-C7 Sinir Kökleri", "Anulus Fibrosus", "Nucleus Pulposus"],
    aggravatingMovements: [
      "Boynu arkaya eğme (Ekstansiyon)",
      "Başı ağrılı tarafa çevirme (Spurling testi)"
    ],
    rehabFocus: [
      "Chin-tuck izometrikleri",
      "Servikal traksiyon",
      "Sinir kaydırma (Nerve gliding)",
      "Nöral mobilizasyon"
    ]
  },
  {
    id: "neck_straightening",
    region: "Boyun",
    title: "Servikal Lordoz Kaybı (Boyun Düzleşmesi)",
    latinName: "Loss of Cervical Lordosis / Upper Cross Syndrome",
    hotspotCoordinates: { x: 0.0, y: 15.0, z: -0.5 },
    cameraTarget: { x: 0.0, y: 15.0, z: 2.5 },
    severity: "Orta",
    category: "Omurga-Sinir",
    description: "Masa başı ve telefon kullanımı sonucu boyunun doğal C-eğrisinin kaybolup C1-C7 omurlarının düzleşmesidir. Modern yaşamın en yaygın postüral bozukluğudur.",
    symptoms: [
      "Ense kökünde kronik sızlama",
      "Servikojenik baş ağrısı",
      "Omuzlarda ağırlık hissi",
      "Hareket kısıtlılığı"
    ],
    affectedStructures: ["M. Trapezius", "M. Levator Scapulae", "Servikal Faset Eklemler"],
    aggravatingMovements: [
      "Uzun süre öne eğik baş pozisyonunda kalma (Text-Neck)"
    ],
    rehabFocus: [
      "Postür düzeltme eğitimi",
      "Pektoral germe",
      "Derin boyun fleksörlerini güçlendirme"
    ]
  },

  // ═══════════════════════════════════════════════════════════════
  // B. OMUZ VE GÖĞÜS BÖLGESİ (Shoulder & Chest Complex)
  // ═══════════════════════════════════════════════════════════════
  {
    id: "shoulder_impingement",
    region: "Omuz",
    title: "Rotator Cuff Sıkışma Sendromu",
    latinName: "Subacromial Impingement Syndrome (SAIS)",
    hotspotCoordinates: { x: 3.5, y: 13.2, z: 0.0 },
    cameraTarget: { x: 3.5, y: 13.2, z: 3.0 },
    severity: "Orta",
    category: "Kas-Tendon",
    description: "Kol yukarı kaldırıldığında supraspinatus tendonunun akromiyon kemiği ile humerus başı arasında sıkışmasıdır. Özellikle baş üstü hareketlerde ağrı oluşturur.",
    symptoms: [
      "Kolu 60°-120° arasında yana kaldırırken şiddetli ağrı (Ağrılı Ark)",
      "Gece omuz üstüne yatamama",
      "Kolda güçsüzlük hissi",
      "Omuz üstünde hassasiyet"
    ],
    affectedStructures: ["M. Supraspinatus Tendonu", "Bursa Subacromialis", "Akromiyon"],
    aggravatingMovements: [
      "Lateral Raise",
      "Overhead Press",
      "Kolu baş üstüne kaldırma"
    ],
    rehabFocus: [
      "Scapular dyskinesis düzeltme",
      "Subakromiyal mesafe açma",
      "Skapular stabilizatörlerin güçlendirilmesi"
    ]
  },
  {
    id: "shoulder_pectoralis_strain",
    region: "Omuz",
    title: "Pektoralis Majör Tendinopatisi & Ödem",
    latinName: "Pectoralis Major Insertional Tendinopathy",
    hotspotCoordinates: { x: 2.2, y: 12.5, z: 0.8 },
    cameraTarget: { x: 2.2, y: 12.5, z: 3.5 },
    severity: "Orta",
    category: "Kas-Tendon",
    description: "Göğüs kasının omuz kemiğine bağlandığı liflerde aşırı mekanik gerilmeye bağlı gelişen doku ödemi ve mikrotravmadır.",
    symptoms: [
      "Göğüs-omuz birleşiminde sızlama",
      "Göğüs kasını sıkınca batma ağrısı",
      "Lokalize hassasiyet",
      "Kolda internal rotasyon güçlüğü"
    ],
    affectedStructures: ["Pectoralis Major Tendonu", "Bicipital Oluk Çevresi", "Anterior Kapsül"],
    aggravatingMovements: [
      "Chest Fly (Göğüs Açış)",
      "Dips",
      "Derin Bench Press (kollar gövde gerisine düşünce)"
    ],
    rehabFocus: [
      "Soğuk Terapi (Kriyoterapi)",
      "Ağrısız İzometrik Kasılma",
      "Modifiye Presler (Floor Press)"
    ]
  },
  {
    id: "shoulder_frozen_shoulder",
    region: "Omuz",
    title: "Adhezif Kapsülit (Donuk Omuz)",
    latinName: "Adhesive Capsulitis",
    hotspotCoordinates: { x: 3.2, y: 13.0, z: -0.3 },
    cameraTarget: { x: 3.2, y: 13.0, z: 3.0 },
    severity: "Yüksek",
    category: "Eklem-Bağ",
    description: "Omuz eklem kapsülünün iltihaplanarak kalınlaşması ve eklem hareket açıklığının neredeyse tamamen kaybolması durumudur. Üç fazda ilerler: donma, donuk, çözülme.",
    symptoms: [
      "Tüm yönlerde şiddetli aktif ve pasif hareket kısıtlılığı",
      "Şiddetli gece ağrısı",
      "Günlük aktivitelerde ciddi zorlanma",
      "Omuzda sürekli tutukluk"
    ],
    affectedStructures: ["Glenohumeral Eklem Kapsülü (Fibrozis ve Kalınlaşma)"],
    aggravatingMovements: [
      "Saç tarama",
      "Arkadaki cebe ulaşma",
      "Dışa rotasyon hareketi"
    ],
    rehabFocus: [
      "Sarkaç (Pendulum) egzersizleri",
      "Kademeli pasif eklem mobilizasyonu",
      "Kapsüler germeler"
    ]
  },

  // ═══════════════════════════════════════════════════════════════
  // C. DİRSEK BÖLGESİ (Elbow Region)
  // ═══════════════════════════════════════════════════════════════
  {
    id: "elbow_lateral_epicondylitis",
    region: "Dirsek",
    title: "Lateral Epikondilit (Tenisçi Dirseği)",
    latinName: "Lateral Epicondylitis (Tendinosis)",
    hotspotCoordinates: { x: 5.8, y: 9.5, z: 0.2 },
    cameraTarget: { x: 5.8, y: 9.5, z: 3.0 },
    severity: "Orta",
    category: "Kas-Tendon",
    description: "Ön kol ekstansör kaslarının dirseğin dış tarafındaki kemik çıkıntısına yapıştığı tendondaki mikroyırtık ve dejenerasyondur.",
    symptoms: [
      "Dirseğin dış yüzünde keskin ağrı",
      "Nesneleri kavrarken elden düşürme",
      "Zayıf kavrama kuvveti",
      "El bileği hareketlerinde ağrı"
    ],
    affectedStructures: ["M. Extensor Carpi Radialis Brevis (ECRB) Tendonu", "Lateral Epikondil"],
    aggravatingMovements: [
      "El bileği ekstansyonu",
      "Kavrama (grip) hareketleri",
      "Kapı kolu çevirme"
    ],
    rehabFocus: [
      "Ekzantrik yükleme (Tyler Twist)",
      "El bileği ekstansör germeleri",
      "Derin doku masajı"
    ]
  },
  {
    id: "elbow_medial_epicondylitis",
    region: "Dirsek",
    title: "Medial Epikondilit (Golfçü Dirseği)",
    latinName: "Medial Epicondylitis",
    hotspotCoordinates: { x: 5.2, y: 9.3, z: -0.2 },
    cameraTarget: { x: 5.2, y: 9.3, z: 3.0 },
    severity: "Orta",
    category: "Kas-Tendon",
    description: "Dirseğin iç tarafındaki kemik çıkıntısında fleksör tendon grubunun aşırı kullanımı sonucu oluşan iltihabi zorlanmadır.",
    symptoms: [
      "Dirseğin iç kısmında hassasiyet",
      "Yumruk yaparken ağrı",
      "El bileğini içe bükünce ağrı",
      "Kavrama güçsüzlüğü"
    ],
    affectedStructures: ["Ön Kol Fleksör Kas Tendonları", "Medial Epikondil"],
    aggravatingMovements: [
      "Wrist Curls",
      "Lat Pulldown tutuşu",
      "Şiddetli yumruk sıkma"
    ],
    rehabFocus: [
      "Ön kol fleksör ekzantrik güçlendirme",
      "Medyal bandaj desteği",
      "İzometrik el bileği egzersizleri"
    ]
  },

  // ═══════════════════════════════════════════════════════════════
  // D. EL VE EL BİLEĞİ BÖLGESİ (Wrist & Hand Region)
  // ═══════════════════════════════════════════════════════════════
  {
    id: "wrist_carpal_tunnel",
    region: "El Bileği",
    title: "Karpal Tünel Sendromu",
    latinName: "Carpal Tunnel Syndrome (CTS)",
    hotspotCoordinates: { x: 7.2, y: 6.8, z: 0.3 },
    cameraTarget: { x: 7.2, y: 6.8, z: 2.5 },
    severity: "Orta",
    category: "Omurga-Sinir",
    description: "El bileğindeki dar kanaldan geçen median sinirin doku şişliği veya kronik basınç nedeniyle sıkışmasıdır. Modern çalışma hayatının en yaygın sinir sıkışma sendromudur.",
    symptoms: [
      "Baş, işaret, orta ve yüzük parmağın yarısında uyuşma",
      "Gece uykudan uyandıran karıncalanma ve yanma",
      "Elden eşya düşürme",
      "İnce motor becerilerde azalma"
    ],
    affectedStructures: ["Nervus Medianus (Median Sinir)", "Flexor Retinaculum", "Karpal Tünel"],
    aggravatingMovements: [
      "Uzun süre klavye/fare kullanımı",
      "El bileği fleksiyonda bekleme (Phalen testi)"
    ],
    rehabFocus: [
      "Gece atelleme (splint)",
      "Median sinir kaydırma (nerve gliding)",
      "Karpal tünel mobilizasyonu"
    ]
  },
  {
    id: "wrist_de_quervain",
    region: "El Bileği",
    title: "De Quervain Tenosinoviti (Başparmak Tendiniti)",
    latinName: "De Quervain Stenosing Tenosynovitis",
    hotspotCoordinates: { x: 7.5, y: 6.5, z: 0.1 },
    cameraTarget: { x: 7.5, y: 6.5, z: 2.5 },
    severity: "Orta",
    category: "Kas-Tendon",
    description: "Başparmağı hareket ettiren tendonların el bileğinin başparmak tarafındaki kılıf içinde sıkışması ve iltihaplanmasıdır.",
    symptoms: [
      "El bileğinin başparmak hizasında şişlik",
      "Keskin batma ağrısı (Finkelstein testi pozitif)",
      "Başparmak hareketlerinde ağrı",
      "Kavramada güçlük"
    ],
    affectedStructures: ["APL (Abductor Pollicis Longus) Tendonu", "EPB (Extensor Pollicis Brevis) Tendon Kılıfları"],
    aggravatingMovements: [
      "Telefon ekranında başparmak kaydırma",
      "Bebek kaldırma",
      "Şişe kapağı açma"
    ],
    rehabFocus: [
      "Spica ateli",
      "Başparmak izometrikleri",
      "Tendon kaydırma egzersizleri"
    ]
  },

  // ═══════════════════════════════════════════════════════════════
  // E. BEL VE PELVİS BÖLGESİ (Lumbar Spine & Pelvis)
  // ═══════════════════════════════════════════════════════════════
  {
    id: "lumbar_disc_herniation",
    region: "Bel",
    title: "Lomber Disk Hernisi (Bel Fıtığı)",
    latinName: "Hernia Disci Lumbalis (L4-S1)",
    hotspotCoordinates: { x: 0.0, y: 9.8, z: -0.6 },
    cameraTarget: { x: 0.0, y: 9.8, z: 3.0 },
    severity: "Yüksek",
    category: "Omurga-Sinir",
    description: "Bel omurları arasındaki jelimsi diskin dışa kayarak omurilikten çıkan sinir köklerine baskı yapmasıdır. Siyatik ağrının en sık nedenidir.",
    symptoms: [
      "Belden kalçaya ve bacağa yayılan elektrik çarpması şeklinde ağrı (Siyatik)",
      "Ayak başparmağında güçsüzlük (düşük ayak riski)",
      "Belde kilitlenme",
      "Öksürme/hapşırma ile artan ağrı"
    ],
    affectedStructures: ["L4-L5 / L5-S1 İntervertebral Disk", "Nervus Ischiadicus (Siyatik Sinir)"],
    aggravatingMovements: [
      "Öne eğilme (Fleksiyon)",
      "Ağır kaldırma",
      "Öne eğilerek rotasyon",
      "Düz bacak kaldırma (SLR)"
    ],
    rehabFocus: [
      "McKenzie ekstansiyon egzersizleri",
      "Core stabilizasyonu (Bird-Dog, Planks)",
      "Lomber traksiyon"
    ]
  },
  {
    id: "pelvis_piriformis_syndrome",
    region: "Pelvis",
    title: "Piriformis Sendromu (Yalancı Siyatik)",
    latinName: "Piriformis Syndrome",
    hotspotCoordinates: { x: 1.2, y: 8.2, z: -0.8 },
    cameraTarget: { x: 1.2, y: 8.2, z: 2.5 },
    severity: "Orta",
    category: "Kas-Tendon",
    description: "Kalçanın derinindeki piriformis kasının spazma girerek hemen altından geçen siyatik siniri sıkıştırmasıdır. Bel fıtığı ile sıklıkla karıştırılır.",
    symptoms: [
      "Derin kalça yanağında ağrı",
      "Uyluk arkasına yayılan uyuşma",
      "Uzun süre oturmakla artan sızlama",
      "Kalça hareketlerinde kısıtlılık"
    ],
    affectedStructures: ["M. Piriformis", "Nervus Ischiadicus (Siyatik Sinir)"],
    aggravatingMovements: [
      "Uzun süre sert zeminde oturma",
      "Uyluk iç rotasyonu"
    ],
    rehabFocus: [
      "Piriformis germesi (Pigeon pose)",
      "Köpük rulo miyofasiyal gevşetme",
      "Gluteal güçlendirme"
    ]
  },

  // ═══════════════════════════════════════════════════════════════
  // F. KALÇA VE KASIK BÖLGESİ (Hip & Groin Region)
  // ═══════════════════════════════════════════════════════════════
  {
    id: "hip_fai_impingement",
    region: "Kalça",
    title: "Femoroasetabular Sıkışma (FAI)",
    latinName: "Femoroacetabular Impingement (Cam / Pincer)",
    hotspotCoordinates: { x: 2.1, y: 8.5, z: 0.2 },
    cameraTarget: { x: 2.1, y: 8.5, z: 3.0 },
    severity: "Orta",
    category: "Kıkırdak-Bursa",
    description: "Kalça eklemini oluşturan kemikler arasındaki anormallik nedeniyle eklem hareket ederken kıkırdak ve labrumun sıkışmasıdır.",
    symptoms: [
      "Kasık bölgesinde 'C işareti' şeklinde derin ağrı",
      "Çömelirken kalçada takılma ve batma hissi",
      "Uzun süre oturunca artan ağrı",
      "Kalça hareket açıklığında azalma"
    ],
    affectedStructures: ["Femur Başı", "Asetabulum", "Kalça Labrumu"],
    aggravatingMovements: [
      "Derin Squat",
      "Kalça fleksyonu ve iç rotasyonu (FADIR testi)"
    ],
    rehabFocus: [
      "Kalça mobilizasyonu",
      "Derin kalça stabilizatörleri güçlendirme",
      "Aşırı fleksyondan kaçınma"
    ]
  },
  {
    id: "hip_trochanteric_bursitis",
    region: "Kalça",
    title: "Trokanterik Bursit (Kalça Yan Ağrısı)",
    latinName: "Greater Trochanteric Pain Syndrome (GTPS)",
    hotspotCoordinates: { x: 3.2, y: 8.0, z: -0.1 },
    cameraTarget: { x: 3.2, y: 8.0, z: 3.0 },
    severity: "Orta",
    category: "Kıkırdak-Bursa",
    description: "Uyluk kemiğinin dış yanındaki kemik çıkıntısının üzerindeki bursa kesesinin iltihaplanmasıdır.",
    symptoms: [
      "Kalçanın tam yan tarafında keskin ağrı",
      "Gece ağrılı yan tarafa yatamama",
      "Merdiven çıkarken ağrı",
      "Kalça dışında hassasiyet"
    ],
    affectedStructures: ["Bursa Trochanterica", "M. Gluteus Medius Tendonu", "M. Gluteus Minimus Tendonu"],
    aggravatingMovements: [
      "Yandan bacak kaldırma (abduksiyon)",
      "Ağrılı tarafa yatma",
      "Uzun yürüyüşler"
    ],
    rehabFocus: [
      "Gluteus Medius güçlendirme",
      "ITB (İlyotibiyal Bant) gevşetme",
      "Lokal soğuk uygulama"
    ]
  },

  // ═══════════════════════════════════════════════════════════════
  // G. DİZ BÖLGESİ (Knee Region)
  // ═══════════════════════════════════════════════════════════════
  {
    id: "knee_acl_tear",
    region: "Diz",
    title: "Ön Çapraz Bağ (ACL) Yırtığı",
    latinName: "Anterior Cruciate Ligament (ACL) Rupture",
    hotspotCoordinates: { x: 1.8, y: 4.5, z: 0.4 },
    cameraTarget: { x: 1.8, y: 4.5, z: 2.5 },
    severity: "Kritik",
    category: "Eklem-Bağ",
    description: "Dizin dönme ve ani durma hareketlerinde uyluk ile kaval kemiğini bağlayan ön çapraz bağın kopması veya dereceli yırtılmasıdır.",
    symptoms: [
      "Yaralanma anında dizden 'POP' sesi",
      "Anında şiddetli şişlik (hemartroz)",
      "Dizde güvensizlik ve 'boşalma' hissi",
      "Yürümede belirgin aksama"
    ],
    affectedStructures: ["Ligamentum Cruciatum Anterius (ACL)", "Diz Eklem Kapsülü"],
    aggravatingMovements: [
      "Ani yön değiştirme (Pivot)",
      "Sıçrama sonrası kötü iniş",
      "Dize dıştan gelen darbe (Valgus stresi)"
    ],
    rehabFocus: [
      "Quadriceps ve Hamstring nöromüsküler kontrolü",
      "Propriyosepsiyon / denge eğitimi",
      "Kademeli yükleme protokolü"
    ]
  },
  {
    id: "knee_patellofemoral_syndrome",
    region: "Diz",
    title: "Patellofemoral Ağrı Sendromu (Koşucu Dizi)",
    latinName: "Patellofemoral Pain Syndrome (PFPS)",
    hotspotCoordinates: { x: 1.8, y: 4.8, z: 0.6 },
    cameraTarget: { x: 1.8, y: 4.8, z: 2.5 },
    severity: "Orta",
    category: "Kıkırdak-Bursa",
    description: "Diz kapağının uyluk kemiği üzerindeki olukta düzgün kaymaması sonucu diz kapağı arkasındaki kıkırdağın tahriş olmasıdır.",
    symptoms: [
      "Diz kapağının önünde künt sızlama",
      "Merdiven inerken ağrı",
      "Uzun süre oturduktan sonra ayağa kalkarken ağrı (Sinema Belirtisi)",
      "Diz kapağı çevresinde hassasiyet"
    ],
    affectedStructures: ["Patella Kıkırdağı", "Troklear Oluk", "VMO (Vastus Medialis Obliquus)"],
    aggravatingMovements: [
      "Merdiven inme/çıkma",
      "Leg Extension",
      "Uzun süreli bükülü diz pozisyonu"
    ],
    rehabFocus: [
      "VMO güçlendirme",
      "Gluteal kas güçlendirme (valgus önleme)",
      "Patellar taping (bantlama)"
    ]
  },
  {
    id: "knee_meniscus_tear",
    region: "Diz",
    title: "Menisküs Yırtığı (Medial/Lateral)",
    latinName: "Meniscal Tear (Medial / Lateral)",
    hotspotCoordinates: { x: 1.5, y: 4.3, z: 0.3 },
    cameraTarget: { x: 1.5, y: 4.3, z: 2.5 },
    severity: "Yüksek",
    category: "Kıkırdak-Bursa",
    description: "Diz eklemindeki şok emici kıkırdak halkaların dönme veya yaşlanmaya bağlı aşınma sonucu yırtılmasıdır.",
    symptoms: [
      "Dizde mekanik 'kilitlenme' hissi",
      "Eklem çizgisinde noktasal hassasiyet",
      "Çömelmede ağrı",
      "Dizde 'takılma' ve şişlik"
    ],
    affectedStructures: ["Medial Menisküs", "Lateral Menisküs (Fibrokıkırdak Diskler)"],
    aggravatingMovements: [
      "Derin tam çömelme (Squat)",
      "Diz bükülüyken dönme (McMurray testi)"
    ],
    rehabFocus: [
      "Eklem içi yükü azaltma",
      "Hamstring/Quadriceps dengeleme",
      "Ağrısız eklem açıklığı egzersizleri"
    ]
  },

  // ═══════════════════════════════════════════════════════════════
  // H. AYAK BİLEĞİ VE TOPUK BÖLGESİ (Ankle & Foot Region)
  // ═══════════════════════════════════════════════════════════════
  {
    id: "ankle_sprain_atfl",
    region: "Ayak Bileği",
    title: "Ayak Bileği Burkulması (ATFL Yırtığı)",
    latinName: "Lateral Ankle Sprain (ATFL)",
    hotspotCoordinates: { x: 1.9, y: 1.2, z: 0.1 },
    cameraTarget: { x: 1.9, y: 1.2, z: 2.0 },
    severity: "Orta",
    category: "Eklem-Bağ",
    description: "Ayak bileğinin içe dönmesi (inversiyon) sonucu dış taraftaki bağların esnemesi veya kopmasıdır. En sık görülen spor yaralanmalarından biridir.",
    symptoms: [
      "Dış ayak bileğinde şiddetli şişlik ve morarma",
      "Üstüne basamama",
      "Lokalize hassasiyet",
      "Eklemde güvensizlik hissi"
    ],
    affectedStructures: ["ATFL (Anterior Talofibular Ligament)", "CFL (Calcaneofibular Ligament)"],
    aggravatingMovements: [
      "Düzensiz zemine basma",
      "İnversiyon mekanizması"
    ],
    rehabFocus: [
      "PEACE & LOVE protokolü",
      "Denge tahtası propriyosepsiyon eğitimi",
      "Fibularis kas güçlendirme"
    ]
  },
  {
    id: "ankle_achilles_tendinopathy",
    region: "Ayak Bileği",
    title: "Aşil Tendinopatisi (Aşil Tendiniti)",
    latinName: "Achilles Tendinopathy",
    hotspotCoordinates: { x: 1.5, y: 1.5, z: -0.6 },
    cameraTarget: { x: 1.5, y: 1.5, z: 2.0 },
    severity: "Yüksek",
    category: "Kas-Tendon",
    description: "Vücudun en güçlü tendonunun aşırı kullanımına bağlı olarak liflerinde meydana gelen mikro bozulma ve kalınlaşmadır.",
    symptoms: [
      "Sabah ilk adımlarda topuk arkasında sertlik ve keskin ağrı",
      "Koşu sırasında tendon boyunca sızlama",
      "Tendonda şişlik ve kalınlaşma",
      "Parmak ucuna yükselmede güçlük"
    ],
    affectedStructures: ["Tendo Calcaneus (Aşil Tendonu)", "M. Gastrocnemius", "M. Soleus"],
    aggravatingMovements: [
      "Parmak ucuna yükselme (Calf Raise)",
      "Tempolu koşu",
      "Zıplama hareketleri"
    ],
    rehabFocus: [
      "Alfredson protokolü (Ekzantrik calf raise)",
      "Heel drop egzersizleri",
      "Kalf germe programı"
    ]
  },
  {
    id: "foot_plantar_fasciitis",
    region: "Ayak",
    title: "Plantar Fasiit (Topuk Dikeni)",
    latinName: "Plantar Fasciitis",
    hotspotCoordinates: { x: 1.5, y: 0.3, z: 0.2 },
    cameraTarget: { x: 1.5, y: 0.3, z: 2.0 },
    severity: "Orta",
    category: "Kas-Tendon",
    description: "Ayak tabanını kaplayan kalın doku bandının topuk kemiğine yapıştığı noktadaki kronik mikrotravma ve iltihaptır.",
    symptoms: [
      "Sabah ilk adımda topuk altında bıçak saplanır gibi ağrı",
      "Günün ilerleyen saatlerinde hafifleme",
      "Uzun süre ayakta kalınca artan sızlama",
      "Topuk altında hassasiyet"
    ],
    affectedStructures: ["Plantar Fasya", "Medial Tubercle of Calcaneus"],
    aggravatingMovements: [
      "Yalınayak sert zeminde yürüme",
      "Uzun süreli ayakta durma"
    ],
    rehabFocus: [
      "Soğuk şişe/top yuvarlama masajı",
      "Plantar fasya ve aşil germeleri",
      "Ortotik tabanlık kullanımı"
    ]
  }
];

// Yardımcı Fonksiyonlar
export function getPathologyById(id) {
  return PATHOLOGIES_DATABASE.find(p => p.id === id);
}

export function getPathologiesByRegion(region) {
  return PATHOLOGIES_DATABASE.filter(p => p.region === region);
}

export function getPathologiesBySeverity(severity) {
  return PATHOLOGIES_DATABASE.filter(p => p.severity === severity);
}

export function getPathologiesByCategory(category) {
  return PATHOLOGIES_DATABASE.filter(p => p.category === category);
}

export function getAllRegions() {
  return [...new Set(PATHOLOGIES_DATABASE.map(p => p.region))];
}

export function getAllCategories() {
  return [...new Set(PATHOLOGIES_DATABASE.map(p => p.category))];
}
