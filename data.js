const SendaData = (() => {
  'use strict';

  // Reemplazar la identidad provisoria y completar los canales aprobados.
  const config = {
    brand: 'Senda',
    whatsapp: '5491133066880',
    email: '',
    gaId: '',
    pixelId: '',
  };
  const navigation = [
    ['#prepagas', 'Prepagas'],
    ['#proceso', 'Cómo funciona'],
    ['#preguntas', 'Preguntas'],
  ];
  // Activar explícitamente nuevas prepagas. Las prestaciones corresponden al plan y la variante indicados.
  const catalog = [
    {
      id: 'omint', enabled: true, name: 'Omint', tone: 'sky', iconImage: 'assets/simbolo-omint.jpg',
      image: 'assets/omint-horizontal.png',
      focus: 'Génesis, Global y Clásico',
      plans: [
        { code: '2500', line: 'Génesis · Empresa 2500_24', coverage: [
          ['Internación', 'Habitación compartida. En las clínicas Santa Isabel y Bazterrica, habitación individual.'],
          ['Farmacia', 'Hasta 40% en medicamentos recetados por profesionales de cartilla, dentro de la red.'],
        ] },
        { code: '4500', line: 'Global · Empresa 4500_23', coverage: [
          ['Internación', 'Habitación individual en los sanatorios de cartilla.'],
          ['Laboratorio', 'Análisis clínicos generales.'],
          ['Farmacia', 'Hasta 40% en medicamentos dentro de la red.'],
        ] },
        { code: '6500', line: 'Clásico · Empresa 6500_21', coverage: [
          ['Internación', 'Habitación individual en los sanatorios de cartilla.'],
          ['Odontología', 'Atención general según el nomenclador de Omint.'],
          ['Emergencias', 'Reintegros con topes fuera del área de atención de Omint.'],
        ] },
      ],
    },
    {
      id: 'sancor', enabled: true, name: 'SanCor Salud', tone: 'sand', iconImage: 'assets/simbolo-sancor.png',
      image: 'assets/sancor-horizontal.webp',
      focus: 'Línea Clásica',
      plans: [
        { code: 'S1000', line: 'AMBA', coverage: [
          ['Salud mental', '30 sesiones ambulatorias al año. El coseguro depende de la modalidad contratada.'],
        ] },
        { code: 'S1500', line: 'AMBA', coverage: [
          ['Rehabilitación', '10 sesiones de reeducación postural global dentro del módulo de kinesiología.'],
          ['Salud mental', '30 sesiones ambulatorias al año. El coseguro depende de la modalidad contratada.'],
        ] },
        { code: 'S3000', line: 'AMBA', coverage: [
          ['Viajes', 'Asistencia internacional al viajero.'],
          ['Reintegros', 'Consultas y otras prestaciones con topes por persona y por prestación.'],
          ['Salud mental', '40 sesiones ambulatorias al año, con coseguro.'],
        ] },
      ],
    },
    {
      id: 'avalian', enabled: true, name: 'Avalian', tone: 'rose', icon: '✦',
      image: 'assets/avalian-logo.png',
      focus: 'Línea Integral',
      plans: [
        { code: 'AS200', coverage: [
          ['Consultas', 'Atención en consultorio y por telemedicina, con coseguro.'],
          ['Farmacia', '40% sobre el precio de venta al público en medicamentos cubiertos.'],
        ] },
        { code: 'AS200SC', line: 'Variante AMBA', coverage: [
          ['Consultas', 'Atención en consultorio y por telemedicina, sin coseguro.'],
          ['Farmacia', '40% sobre el precio de venta al público en medicamentos cubiertos.'],
        ] },
        { code: 'AS204', coverage: [
          ['Consultas', 'Atención en consultorio y por telemedicina, con coseguro.'],
          ['Farmacia', '40% sobre el precio de venta al público en medicamentos cubiertos.'],
        ] },
      ],
    },
    {
      id: 'doctored', enabled: true, name: 'DoctoRed', tone: 'lime', icon: '✚',
      image: 'assets/doctored-logo.png',
      focus: 'Medicina privada',
      plans: [
        { code: '500', coverage: [
          ['Internación', 'Habitación compartida.'],
          ['Óptica', 'Un par de anteojos por año calendario para menores de 15 años.'],
        ] },
        { code: '1000', coverage: [
          ['Internación', 'Habitación compartida.'],
          ['Óptica', 'Un par de anteojos por año calendario para menores de 15 años.'],
        ] },
        { code: '2000', coverage: [
          ['Internación', 'Habitación individual.'],
          ['Óptica', 'Un par de anteojos por año calendario sin límite de edad.'],
          ['Viajes', 'Asistencia internacional con tope para un evento por año.'],
        ] },
        { code: '3000', coverage: [
          ['Internación', 'Habitación individual.'],
          ['Óptica', 'Un par de anteojos por año calendario sin límite de edad.'],
          ['Viajes', 'Asistencia internacional con tope para un evento por año.'],
        ] },
      ],
    },
    {
      id: 'premedic', enabled: true, name: 'Grupo Premedic', tone: 'teal',
      image: 'assets/premedic-horizontal.png',
      plans: [
        { code: 'C100', coverage: [
          ['Consultorio', 'Consultas con coseguro y con tope desde el ingreso.'],
          ['Telemedicina', 'Videoconsultas sin cargo desde el ingreso.'],
        ] },
        { code: '200', coverage: [
          ['Consultorio', 'Consultas con coseguro, sin tope.'],
          ['Guardia y telemedicina', 'Atención sin cargo desde el ingreso.'],
        ] },
        { code: '300', coverage: [
          ['Consultas', 'En consultorio, a domicilio y por videollamada sin cargo desde el ingreso.'],
          ['Laboratorio', 'Hasta 8 determinaciones hormonales o de alta complejidad por año, a partir de los 4 meses.'],
        ] },
        { code: '400', coverage: [
          ['Consultas', 'En consultorio y a domicilio sin cargo desde el ingreso.'],
          ['Laboratorio', 'Hasta 12 determinaciones hormonales o de alta complejidad por año, a partir de los 2 meses.'],
        ] },
        { code: '500', coverage: [
          ['Consultas', 'En consultorio, a domicilio y por videollamada sin cargo desde el ingreso.'],
          ['Ecografías', 'Ecografía transvaginal o transrectal sin cargo y sin tope desde el ingreso.'],
        ] },
        { code: 'por aportes', coverage: [
          ['Consultas', 'En consultorio y a domicilio con coseguro y con tope.'],
          ['Laboratorio', 'Análisis de rutina por derivación sin cargo desde el ingreso.'],
        ] },
      ],
    },
  ];
  const providers = catalog.filter(provider => provider.enabled);

  return { config, navigation, providers };
})();



