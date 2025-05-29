import React, { useState } from 'react';
    import { useParams, Link } from 'react-router-dom';
    import { motion } from 'framer-motion';
    import { Button } from '@/components/ui/button';
    import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
    import { ChevronLeft, CheckCircle, Sparkles, Phone, Home } from 'lucide-react';
    import ContactModal from '@/components/ContactModal';

    const fadeIn = {
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
    };

    const serviceDetailsData = {
      'home-cleaning': {
        title: 'تنظيف شامل للمنازل',
        description: 'نقدم خدمة تنظيف شاملة وعميقة لمنزلك، تشمل جميع الغرف والمرافق. نستخدم مواد تنظيف آمنة وفعالة لضمان بيئة صحية ونظيفة لك ولعائلتك. فريقنا مدرب على أعلى مستوى للتعامل مع كافة أنواع الأوساخ والبقع.',
        features: ['تنظيف غرف النوم والمعيشة', 'مسح الأرضيات وتلميع الأسطح', 'تنظيف النوافذ والأبواب', 'إزالة الغبار من جميع الأثاث والديكورات', 'تنظيم وترتيب الأغراض بشكل احترافي'],
        images: [
          { alt: "غرفة معيشة نظيفة ومشرقة", query: "bright clean living room after professional cleaning" },
          { alt: "عامل ينظف نافذة كبيرة", query: "professional cleaner wiping large window" }
        ],
        relatedServices: [
            { name: "تنظيف مطابخ وحمامات", link: "/services/kitchen-bathroom"},
            { name: "غسيل مكيفات", link: "/services/ac-cleaning"}
        ]
      },
      'kitchen-bathroom': {
        title: 'تنظيف مطابخ وحمامات',
        description: 'المطابخ والحمامات هي أماكن تجمع الجراثيم. نقوم بتنظيفها وتعقيمها بالكامل باستخدام مواد متخصصة تقضي على البكتيريا وتتركها لامعة ونظيفة. نهتم بأدق التفاصيل من صنابير وأحواض إلى الأجهزة والبلاط.',
        features: ['تنظيف وتعقيم الأحواض والصنابير', 'إزالة الدهون المتراكمة في المطبخ', 'تنظيف وتعقيم المراحيض والبانيو', 'تلميع المرايا والأسطح الزجاجية', 'تنظيف خزائن المطبخ من الداخل والخارج'],
        images: [
            { alt: "مطبخ حديث ولامع بعد التنظيف", query: "sparkling modern kitchen after deep cleaning" },
            { alt: "حمام نظيف ومعقم بالكامل", query: "spotless clean bathroom with shining tiles" }
        ],
        relatedServices: [
            { name: "تنظيف شامل للمنازل", link: "/services/home-cleaning"},
            { name: "إزالة الروائح الكريهة", link: "/services/odor-removal"}
        ]
      },
      'floor-steam': {
        title: 'غسيل أرضيات وتعقيم بالبخار',
        description: 'نستخدم أحدث تقنيات التنظيف بالبخار لغسيل وتعقيم جميع أنواع الأرضيات (سيراميك، رخام، باركيه). البخار يقضي على 99.9% من الجراثيم والبكتيريا بدون استخدام مواد كيميائية ضارة.',
        features: ['تنظيف عميق لجميع أنواع الأرضيات', 'تعقيم فعال بالبخار الساخن', 'إزالة البقع الصعبة والأوساخ المتراكمة', 'آمن على الأطفال والحيوانات الأليفة', 'يجف بسرعة ويترك الأرضيات لامعة'],
        images: [
          {alt: "عامل يستخدم جهاز تنظيف بالبخار على أرضية سيراميك", query: "worker using steam cleaner on ceramic floor"},
          {alt: "أرضية باركيه لامعة بعد التنظيف بالبخار", query: "shiny parquet floor after steam cleaning"}
        ],
        relatedServices: [
            { name: "تنظيف شامل للمنازل", link: "/services/home-cleaning"},
            { name: "تنظيف أثاث ومفروشات", link: "/services/furniture-upholstery"}
        ]
      },
      'window-facade': {
        title: 'تنظيف نوافذ وواجهات زجاجية',
        description: 'نوافذ نظيفة تعني إضاءة أفضل ومنظر أجمل. نقوم بتنظيف النوافذ والواجهات الزجاجية الداخلية والخارجية، بما في ذلك الإطارات، لتستمتع بمنظر نقي وواضح.',
        features: ['تنظيف الزجاج من الداخل والخارج', 'إزالة الأتربة والبقع والعوالق', 'تنظيف إطارات النوافذ', 'استخدام مواد تلميع خاصة لزجاج براق', 'آمن للمباني المرتفعة (عند الحاجة)'],
        images: [
            {alt: "نافذة كبيرة ولامعة تطل على منظر طبيعي", query: "large sparkling clean window overlooking a view"},
            {alt: "عامل ينظف واجهة زجاجية لمبنى تجاري", query: "cleaner washing glass facade of commercial building"}
        ],
         relatedServices: [
            { name: "تنظيف شامل للمنازل", link: "/services/home-cleaning"},
            { name: "تنظيف مكاتب وشركات", link: "/services/office-cleaning"}
        ]
      },
       'furniture-upholstery': {
        title: 'تنظيف أثاث ومفروشات',
        description: 'نعيد الحياة لأثاثك ومفروشاتك. نستخدم طرق تنظيف متخصصة لكل نوع من الأقمشة والمواد (كنب، سجاد، ستائر) لإزالة البقع، الأوساخ، والروائح الكريهة مع الحفاظ على جودتها.',
        features: ['تنظيف الكنب والمقاعد القماشية والجلدية', 'غسيل السجاد والموكيت بالبخار أو التنظيف الجاف', 'تنظيف الستائر وهي معلقة', 'إزالة البقع الصعبة والروائح', 'تجديد مظهر الأثاث وإطالة عمره'],
        images: [
            {alt: "كنبة نظيفة ذات ألوان زاهية بعد التنظيف", query: "clean vibrant sofa after upholstery cleaning"},
            {alt: "عامل ينظف سجادة باستخدام آلة متخصصة", query: "professional cleaning a carpet with specialized machine"}
        ],
         relatedServices: [
            { name: "تنظيف شامل للمنازل", link: "/services/home-cleaning"},
            { name: "غسيل شقق", link: "/services/apartment-cleaning"}
        ]
      },
      'air-purification': {
        title: 'تعطير المنزل وتعقيم الهواء',
        description: 'استمتع بهواء نقي ومنعش في منزلك. نقدم خدمات تعطير متقدمة وتعقيم للهواء باستخدام أجهزة ومواد خاصة تقضي على مسببات الروائح والجراثيم المحمولة جواً.',
        features: ['استخدام معطرات جو طبيعية وآمنة', 'أجهزة تعقيم هواء متطورة', 'القضاء على البكتيريا والفيروسات في الهواء', 'تحسين جودة الهواء الداخلي', 'إضفاء رائحة عطرة ومميزة لمنزلك'],
        images: [
            {alt: "جهاز تنقية هواء يعمل في غرفة معيشة أنيقة", query: "air purifier working in stylish living room"},
            {alt: "رذاذ معطر ينتشر في الهواء مع إضاءة خافتة", query: "aromatic mist diffusing in a subtly lit room"}
        ],
        relatedServices: [
            { name: "تنظيف شامل للمنازل", link: "/services/home-cleaning"},
            { name: "إزالة الروائح الكريهة", link: "/services/odor-removal"}
        ]
      },
      'ac-cleaning': {
        title: 'غسيل المكيفات الداخلية والخارجية',
        description: 'حافظ على كفاءة مكيفك وجودة الهواء. نقوم بغسيل وتنظيف وحدات التكييف الداخلية والخارجية، وإزالة الأتربة والعوالق التي تؤثر على أدائه وتسبب روائح كريهة.',
        features: ['تنظيف فلاتر المكيف', 'غسيل الوحدة الداخلية والخارجية', 'فحص مستوى الفريون (اختياري)', 'تحسين كفاءة التبريد', 'التخلص من الروائح الصادرة من المكيف'],
        images: [
            {alt: "فني يقوم بتنظيف وحدة تكييف داخلية", query: "technician cleaning indoor AC unit"},
            {alt: "وحدة تكييف خارجية نظيفة بعد الصيانة", query: "clean outdoor AC unit after maintenance"}
        ],
        relatedServices: [
            { name: "تنظيف شامل للمنازل", link: "/services/home-cleaning"},
            { name: "تعطير وتعقيم الهواء", link: "/services/air-purification"}
        ]
      },
      'odor-removal': {
        title: 'إزالة الروائح الكريهة',
        description: 'نتخلص من الروائح المزعجة في منزلك أو سيارتك بشكل فعال. نستخدم تقنيات متخصصة لتحديد مصدر الرائحة والقضاء عليها نهائياً، وليس فقط تغطيتها.',
        features: ['تحديد مصدر الروائح الكريهة', 'معالجة متخصصة لروائح الدخان، الحيوانات الأليفة، الطهي، الرطوبة', 'استخدام مواد طبيعية وممتصات للروائح', 'تعقيم المناطق المتأثرة', 'إعادة الانتعاش والنقاء للمكان'],
        images: [
            {alt: "يد ترش معطر جو في غرفة ذات إضاءة طبيعية", query: "hand spraying air freshener in a naturally lit room"},
            {alt: "أقمشة نظيفة ومعطرة موضوعة بشكل أنيق", query: "freshly scented clean fabrics neatly arranged"}
        ],
        relatedServices: [
            { name: "تنظيف شامل للمنازل", link: "/services/home-cleaning"},
            { name: "تنظيف أثاث ومفروشات", link: "/services/furniture-upholstery"}
        ]
      },
      'apartment-cleaning': {
        title: 'غسيل شقق',
        description: 'خدمة غسيل وتنظيف متكاملة للشقق، سواء كانت مفروشة أو جديدة. نهتم بكل زاوية وركن لضمان تسليم شقة نظيفة وجاهزة للسكن أو الاستخدام.',
        features: ['تنظيف شامل لجميع غرف الشقة', 'تنظيف المطابخ والحمامات بعمق', 'غسيل الأرضيات والنوافذ', 'إزالة أي بقايا بناء أو دهانات (للشقق الجديدة)', 'تعطير الشقة عند الانتهاء'],
        images: [
            {alt: "شقة حديثة نظيفة ومشرقة مع نوافذ كبيرة", query: "bright and clean modern apartment with large windows"},
            {alt: "عامل ينظف أرضية شقة جديدة قبل تسليمها", query: "worker cleaning floor of a new apartment before handover"}
        ],
        relatedServices: [
            { name: "تنظيف شامل للمنازل", link: "/services/home-cleaning"},
            { name: "تنظيف أثاث ومفروشات", link: "/services/furniture-upholstery"}
        ]
      },
      'office-cleaning': {
        title: 'تنظيف مكاتب وشركات',
        description: 'بيئة عمل نظيفة تعزز الإنتاجية وتترك انطباعًا جيدًا لدى العملاء. نقدم خدمات تنظيف مكاتب وشركات احترافية، مجدولة حسب احتياجاتك (يومي، أسبوعي، شهري).',
        features: ['تنظيف المكاتب ومحطات العمل', 'تفريغ سلال المهملات', 'تنظيف وتعقيم دورات المياه والمطابخ الصغيرة', 'تنظيف الأرضيات والسجاد المكتبي', 'العناية بغرف الاجتماعات ومناطق الاستقبال'],
        images: [
            {alt: "مكتب حديث ومنظم ونظيف مع إضاءة جيدة", query: "modern clean and organized office space with good lighting"},
            {alt: "فريق تنظيف يعمل في مكاتب شركة ليلاً", query: "cleaning crew working in an office building at night"}
        ],
        relatedServices: [
            { name: "تنظيف زجاج ومكاتب وأرضيات (تجاري)", link: "/services/commercial-general"},
            { name: "تعقيم دورات مياه ومداخل (تجاري)", link: "/services/commercial-sanitization"}
        ]
      },
      'commercial-sanitization': {
        title: 'تعقيم دورات المياه والمداخل في بيئات العمل',
        description: 'نولي أهمية قصوى لتعقيم المناطق عالية الاستخدام مثل دورات المياه ومداخل الشركات والمؤسسات. نستخدم معقمات قوية للقضاء على الجراثيم والفيروسات.',
        features: ['تعقيم شامل لدورات المياه (مراحيض، أحواض، أرضيات)', 'تعقيم مقابض الأبواب ونقاط اللمس المتكرر', 'تطهير المداخل والممرات الرئيسية', 'استخدام مواد تعقيم معتمدة وفعالة', 'خدمات مجدولة لضمان نظافة مستمرة'],
        images: [
            {alt: "عامل يرتدي قفازات يقوم بتعقيم حوض في دورة مياه عامة", query: "gloved hand sanitizing a sink in a public restroom"},
            {alt: "مدخل شركة نظيف ولامع يعكس الاحترافية", query: "clean and shining entrance of a corporate building"}
        ],
        relatedServices: [
            { name: "تنظيف مكاتب وشركات", link: "/services/office-cleaning"},
            { name: "تنظيف وتعطير استقبال وصالات", link: "/services/reception-cleaning"}
        ]
      },
      'commercial-general': {
        title: 'تنظيف الزجاج والمكاتب والأرضيات (تجاري)',
        description: 'نقدم حلول تنظيف عامة للمساحات التجارية تشمل تنظيف الزجاج الداخلي والخارجي، أسطح المكاتب، وجميع أنواع الأرضيات لضمان بيئة عمل نظيفة وجذابة.',
        features: ['تنظيف وتلميع الواجهات الزجاجية والأقسام الداخلية', 'مسح وتنظيف أسطح المكاتب والطاولات', 'كنس وغسيل الأرضيات بأنواعها', 'العناية بالتفاصيل الدقيقة في المكاتب', 'جدولة مرنة لتناسب أوقات عملك'],
        images: [
            {alt: "عامل ينظف نافذة مكتبية كبيرة من الداخل", query: "worker cleaning a large office window from the inside"},
            {alt: "أرضية مكتب لامعة ونظيفة تعكس الإضاءة", query: "shiny clean office floor reflecting light"}
        ],
        relatedServices: [
            { name: "تنظيف مكاتب وشركات", link: "/services/office-cleaning"},
            { name: "تنظيف وتعطير استقبال وصالات", link: "/services/reception-cleaning"}
        ]
      },
      'reception-cleaning': {
        title: 'تنظيف وتعطير مكاتب الاستقبال وصالات الاجتماعات',
        description: 'منطقة الاستقبال وصالات الاجتماعات هي واجهة شركتك. نحرص على أن تكون نظيفة، مرتبة، ومعطرة بشكل دائم لتعكس صورة إيجابية عن عملك.',
        features: ['تنظيف عميق لمكاتب الاستقبال والأثاث الموجود بها', 'ترتيب المجلات والمواد التعريفية', 'تنظيف وتعطير صالات الاجتماعات', 'العناية بالأرضيات والإضاءة', 'ضمان بيئة استقبال احترافية وجذابة'],
        images: [
            {alt: "منطقة استقبال فندقية فاخرة ونظيفة", query: "luxurious and clean hotel reception area"},
            {alt: "قاعة اجتماعات مجهزة ونظيفة قبل اجتماع مهم", query: "well-equipped and clean meeting room before an important meeting"}
        ],
        relatedServices: [
            { name: "تنظيف مكاتب وشركات", link: "/services/office-cleaning"},
            { name: "تنظيف زجاج ومكاتب وأرضيات (تجاري)", link: "/services/commercial-general"}
        ]
      },
       'car-exterior': {
        title: 'غسيل خارجي للسيارة (بخار/ماء)',
        description: 'امنح سيارتك اللمعان الذي تستحقه. نقدم خدمة غسيل خارجي إما بالبخار الصديق للبيئة والذي يوفر الماء، أو الغسيل التقليدي بالماء والصابون عالي الجودة.',
        features: ['غسيل الهيكل الخارجي بالكامل', 'تنظيف الإطارات والجنوط', 'تجفيف السيارة بعناية لتجنب البقع', 'اختيار بين الغسيل بالبخار أو الماء', 'مواد تنظيف آمنة على طلاء السيارة'],
        images: [
            {alt: "سيارة سوداء لامعة يتم غسلها بالبخار", query: "shiny black car being steam washed"},
            {alt: "عامل يجفف سيارة فضية بعد غسلها بالماء", query: "worker drying a silver car after water wash"}
        ],
        relatedServices: [
            { name: "تنظيف داخلي شامل للسيارة", link: "/services/car-interior"},
            { name: "تلميع خارجي للسيارة", link: "/services/car-polishing"}
        ]
      },
      'car-interior': {
        title: 'تنظيف داخلي شامل للسيارة',
        description: 'نظافة داخلية لا مثيل لها! خدمة تشمل تنظيف المقاعد (قماش/جلد)، الأرضيات، الطبلون، الأبواب من الداخل، والزجاج. نزيل الأوساخ، البقع، والروائح.',
        features: ['تنظيف المقاعد وإزالة البقع', 'كنس وتنظيف الأرضيات والدواسات', 'مسح وتلميع الطبلون والأسطح البلاستيكية', 'تنظيف الزجاج الداخلي', 'تعطير المقصورة (اختياري)'],
        images: [
            {alt: "مقصورة سيارة نظيفة جداً مع مقاعد جلدية", query: "very clean car interior with leather seats"},
            {alt: "عامل ينظف أرضية سيارة بالمكنسة الكهربائية", query: "worker vacuuming car floor mats"}
        ],
        relatedServices: [
            { name: "غسيل خارجي للسيارة", link: "/services/car-exterior"},
            { name: "تعقيم داخل السيارة بالبخار", link: "/services/car-steam-sanitization"}
        ]
      },
      'car-polishing': {
        title: 'تلميع خارجي للسيارة',
        description: 'استعد بريق سيارتك الأصلي. خدمة تلميع خارجية تزيل الخدوش السطحية وتعيد اللمعان للطلاء، مع إضافة طبقة حماية للحفاظ على هذا المظهر لفترة أطول.',
        features: ['إزالة الخدوش الدقيقة وعلامات الأكسدة', 'استخدام مواد تلميع عالية الجودة (واكس/بوليش)', 'استعادة عمق اللون ولمعان الطلاء', 'تطبيق طبقة حماية من الشمع (واكس)', 'يجعل سطح السيارة ناعمًا وطاردًا للماء'],
        images: [
            {alt: "سيارة حمراء لامعة تحت إضاءة قوية تظهر انعكاسات التلميع", query: "glossy red car under bright light showing polishing reflections"},
            {alt: "يد عامل تقوم بتلميع هيكل سيارة بقطعة قماش مايكروفايبر", query: "hand polishing a car body with microfiber cloth"}
        ],
        relatedServices: [
            { name: "غسيل خارجي للسيارة", link: "/services/car-exterior"},
            { name: "تلميع سيارات بالبخار", link: "/services/car-steam-polishing"}
        ]
      },
      'car-steam-polishing': {
        title: 'تلميع سيارات بالبخار',
        description: 'جمعنا بين قوة البخار في التنظيف العميق وفن التلميع لإعطاء سيارتك مظهراً استثنائياً. هذه الخدمة تنظف وتلمع في آن واحد، مع الحفاظ على البيئة.',
        features: ['تنظيف عميق للطلاء باستخدام البخار', 'إزالة الأوساخ العنيدة والقطران', 'تلميع لطيف وآمن على الطلاء', 'يعزز لمعان السيارة ويحميها', 'صديق للبيئة ويقلل استهلاك الماء'],
        images: [
            {alt: "سيارة زرقاء يتم تلميعها بالبخار في محطة غسيل", query: "blue car being steam polished at a car wash station"},
            {alt: "تفاصيل مقربة لقطرات ماء تنزلق على سطح سيارة ملمعة بالبخار", query: "close up of water beading on a steam polished car surface"}
        ],
        relatedServices: [
            { name: "تلميع خارجي للسيارة", link: "/services/car-polishing"},
            { name: "تعقيم داخل السيارة بالبخار", link: "/services/car-steam-sanitization"}
        ]
      },
      'car-steam-sanitization': {
        title: 'تعقيم داخل السيارة بالبخار',
        description: 'بيئة صحية داخل سيارتك. نستخدم قوة البخار لتعقيم المقصورة الداخلية، بما في ذلك المقاعد، الأسطح، ونظام التهوية، للقضاء على الجراثيم والبكتيريا المسببة للروائح.',
        features: ['تعقيم المقاعد والأرضيات وجميع الأسطح بالبخار', 'القضاء على البكتيريا والفيروسات والعفن', 'إزالة الروائح من مصدرها', 'آمن على جميع مواد المقصورة الداخلية', 'مثالي للأشخاص الذين يعانون من الحساسية'],
        images: [
            {alt: "عامل يستخدم جهاز بخار لتعقيم مقاعد سيارة", query: "worker using steam machine to sanitize car seats"},
            {alt: "فتحات تهوية مكيف سيارة يتم تعقيمها بالبخار", query: "car AC vents being steam sanitized"}
        ],
        relatedServices: [
            { name: "تنظيف داخلي شامل للسيارة", link: "/services/car-interior"},
            { name: "تلميع سيارات بالبخار", link: "/services/car-steam-polishing"}
        ]
      },
      'mobile-car-wash': {
        title: 'غسيل سيارات متنقل',
        description: 'راحتك تهمنا! نأتيك أينما كنت لغسيل سيارتك (منزلك، عملك، أو أي موقع آخر). خدمة متكاملة بنفس جودة مراكزنا الثابتة، ولكن بمزيد من الراحة لك.',
        features: ['خدمة غسيل في موقعك المفضل', 'توفير الوقت والجهد', 'يشمل الغسيل الخارجي والداخلي (حسب الطلب)', 'مجهزون بالكامل (ماء، كهرباء، مواد تنظيف)', 'حجز مواعيد مرن وسهل'],
        images: [
            {alt: "شاحنة غسيل سيارات متنقلة متوقفة بجانب سيارةลูกค้า", query: "mobile car wash van parked next to a customer's car"},
            {alt: "عامل يغسل سيارة في موقف سيارات بمبنى سكني", query: "worker washing a car in a residential parking lot"}
        ],
        relatedServices: [
            { name: "غسيل خارجي للسيارة", link: "/services/car-exterior"},
            { name: "تنظيف داخلي شامل للسيارة", link: "/services/car-interior"}
        ]
      },
      'car-wash-subscription': {
        title: 'خدمة اشتراك شهري لغسيل السيارة',
        description: 'حافظ على سيارتك نظيفة ولامعة طوال الشهر بدون عناء. نقدم باقات اشتراك شهرية مرنة تشمل عددًا محددًا من الغسلات (خارجي/داخلي) بأسعار مخفضة.',
        features: ['باقات متنوعة تناسب احتياجاتك', 'أسعار مخفضة مقارنة بالخدمات الفردية', 'جدولة تلقائية أو حسب الطلب للغسلات', 'ضمان نظافة دائمة لسيارتك', 'إمكانية إضافة خدمات أخرى للباقة'],
        images: [
            {alt: "تقويم عليه علامات تشير لمواعيد غسيل سيارة مجدولة", query: "calendar with marked dates for scheduled car washes"},
            {alt: "مجموعة سيارات نظيفة ولامعة في صف واحد", query: "row of clean and shiny cars"}
        ],
        relatedServices: [
            { name: "غسيل خارجي للسيارة", link: "/services/car-exterior"},
            { name: "غسيل سيارات متنقل", link: "/services/mobile-car-wash"}
        ]
      }
    };

    const ServiceHeader = ({ title, description }) => (
      <motion.header variants={fadeIn} className="mb-12 text-center md:text-right">
        <h1 className="text-4xl md:text-6xl font-extrabold text-gradient-professional mb-4">{title}</h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto md:mx-0">{description}</p>
      </motion.header>
    );

    const ServiceFeatures = ({ features }) => (
      <Card className="shadow-xl border-primary/20">
        <CardHeader>
          <CardTitle className="text-2xl text-primary flex items-center">
            <Sparkles className="w-7 h-7 mr-3 rtl:ml-3 rtl:mr-0 text-accent" />
            مميزات الخدمة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {features.map((feature, index) => (
              <motion.li 
                key={index} 
                className="flex items-start space-x-3 rtl:space-x-reverse"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 + 0.3 }}
              >
                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                <span className="text-foreground/90">{feature}</span>
              </motion.li>
            ))}
          </ul>
        </CardContent>
      </Card>
    );

    const CallToAction = ({ serviceTitle, onOpenContactModal }) => (
      <motion.div 
        variants={fadeIn} 
        className="mt-12 p-8 bg-gradient-to-br from-secondary to-primary rounded-xl text-primary-foreground shadow-2xl text-center"
      >
        <h3 className="text-3xl font-bold mb-4">هل أنت جاهز لتجربة خدمة مميزة؟</h3>
        <p className="text-lg mb-6">
          دع فريقنا المحترف يعتني بنظافة منزلك، شركتك، أو سيارتك. الجودة شعارنا والرضا هدفنا.
        </p>
        <Button 
          size="lg" 
          className="bg-white text-primary hover:bg-slate-100 font-semibold text-lg px-10 py-4 shadow-lg transform hover:scale-105 transition-transform"
          onClick={onOpenContactModal}
        >
          اطلب {serviceTitle} الآن <Phone className="mr-3 h-6 w-6 rtl:ml-3 rtl:mr-0" />
        </Button>
      </motion.div>
    );

    const ServiceImages = ({ images }) => (
      <Card className="shadow-lg border-secondary/20">
        <CardHeader>
          <CardTitle className="text-xl text-secondary">صور من أعمالنا</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4">
          {images && images.map((image, index) => (
             <motion.div 
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.2 + 0.5 }}
                className="overflow-hidden rounded-lg shadow-md aspect-video"
             >
                <img  class="w-full h-full object-cover transition-transform duration-300 hover:scale-110" alt={image.alt} src="https://images.unsplash.com/photo-1697256200022-f61abccad430" />
             </motion.div>
          ))}
        </CardContent>
      </Card>
    );

    const RelatedServices = ({ services }) => (
      <Card className="shadow-lg border-accent/20">
        <CardHeader>
          <CardTitle className="text-xl text-accent">خدمات ذات صلة</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {services.map((related, index) => (
              <li key={index}>
                <Link to={related.link} className="flex items-center text-foreground/80 hover:text-accent transition-colors group">
                   <Sparkles className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0 text-accent/70 group-hover:text-accent transition-colors" />
                  {related.name}
                  <ChevronLeft className="h-4 w-4 mr-auto rtl:ml-auto rtl:mr-0 opacity-0 group-hover:opacity-100 transition-opacity transform rtl:rotate-180" />
                </Link>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    );

    const ServicePage = () => {
      const { serviceId } = useParams();
      const service = serviceDetailsData[serviceId];
      const [isModalOpen, setIsModalOpen] = useState(false);

      if (!service) {
        return (
          <div className="container mx-auto px-4 py-16 text-center">
            <h1 className="text-4xl font-bold text-destructive mb-4">الخدمة غير موجودة</h1>
            <p className="text-muted-foreground mb-8">عفواً، الخدمة التي تبحث عنها غير متوفرة حالياً.</p>
            <Link to="/">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Home className="ml-2 h-5 w-5" /> العودة للرئيسية
              </Button>
            </Link>
          </div>
        );
      }
      
      const openContactModalHandler = () => {
        setIsModalOpen(true);
      };

      return (
        <motion.div 
          className="container mx-auto px-4 py-12 md:py-20"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          dir="rtl"
        >
          <ContactModal isOpen={isModalOpen} setIsOpen={setIsModalOpen} serviceName={service.title} />
          <div className="mb-8">
            <Link to="/" className="inline-flex items-center text-primary hover:text-primary/80 transition-colors">
              <ChevronLeft className="mr-2 h-5 w-5 rtl:ml-2 rtl:mr-0 transform rtl:rotate-180" />
              العودة إلى جميع الخدمات
            </Link>
          </div>

          <ServiceHeader title={service.title} description={service.description} />

          <div className="grid md:grid-cols-5 gap-10">
            <motion.main variants={fadeIn} className="md:col-span-3">
              <ServiceFeatures features={service.features} />
              <CallToAction serviceTitle={service.title} onOpenContactModal={openContactModalHandler} />
            </motion.main>

            <motion.aside variants={fadeIn} className="md:col-span-2 space-y-8">
              {service.images && service.images.length > 0 && <ServiceImages images={service.images} />}
              {service.relatedServices && service.relatedServices.length > 0 && <RelatedServices services={service.relatedServices} />}
            </motion.aside>
          </div>
        </motion.div>
      );
    };

    export default ServicePage;