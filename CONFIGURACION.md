# Configuración y publicación

Para abrir el sitio directamente, hacé doble clic en `index.html`. Para probarlo por HTTP con Node.js instalado, ejecutá `npm run dev` y abrí [localhost:4173](http://localhost:4173). El proyecto usa HTML, CSS y scripts JavaScript. Para publicar, subí `index.html`, los estilos, los scripts declarados en `index.html` y la carpeta `assets/` a un hosting estático con HTTPS. `server.js` sirve para desarrollo local.

En `data.js`, reemplazá la marca provisoria Senda y cargá el email y el número internacional de WhatsApp de la cuenta comercial, solo con dígitos. En producción, verificá el chat con ese número, revisá los metadatos del sitio y agregá el dominio canónico y una URL absoluta para la imagen social. La fotografía de portada es una escena ilustrativa generada para el proyecto.

## Catálogo público

El explorador y el cotizador usan la misma lista, filtrada por `enabled: true`. Los nombres se muestran en texto. Para publicar otra ficha, agregá su identificador, nombre, introducción, enlace oficial y planes documentados, y activala explícitamente.

| Empresa | Referencias consultadas y alcance |
| --- | --- |
| Omint | El Drive contiene cuadros 2500-24, 4500-23 y 6500-21/20. La [búsqueda oficial de cartillas](https://www.omint.com.ar/Website2/Default.aspx?tabid=1500&texto=cartilla+on+line) distingue las tres líneas. Se incorporó una prestación de la variante Empresa 2500_24 y el alcance regional de la [cartilla 4500](https://www.omint.com.ar/website2/default.aspx?tabid=5546). |
| SanCor Salud | El Drive organiza las fichas por región, entre ellas AMBA. La [página oficial de planes](https://sancorsalud.com.ar/cotiza-tu-plan/) describe S1000, S1500 y S3000. Se incorporaron diferencias en salud mental, internación, viajes y reintegros. |
| Avalian | El Drive incluye el Diagrama de Cobertura Integral. La [edición pública del diagrama](https://avalian.com/uploads/planes_corporativos/1/diagrama/0001_Diagrama_de_Cobertura-INTEGRAL_compressed__1_.pdf) distingue AS200, AS200SC y AS204. Se incorporaron diferencias en coseguros y el alcance AMBA de AS200SC en esa ficha. |
| DoctoRed | El Drive usa la denominación DOCTORED y organiza las fichas en 500, 1000, 2000 y 3000. La [oferta oficial](https://www.doctored.com.ar/planes/asociarme) coincide con esos nombres y códigos. Se incorporó la modalidad de aportes para el 500 y el tipo de internación y telemedicina del [cuadro oficial 1000](https://cdn.doctored.com.ar/app-institucional/alcance_cobertura/1000.pdf). |

Al cotizar, confirmá las variantes que se comercializan en la localidad, el padrón vigente de prestadores, las condiciones de ingreso y los valores. El sitio enlaza páginas oficiales para que el visitante pueda revisar la documentación. Las fichas regionales por sí solas no prueban la disponibilidad comercial ni la vigencia de una clínica para cada localidad.

## Campañas y consentimiento

Los identificadores `gaId` y `pixelId` quedan vacíos de origen. Con alguno configurado, el visitante elige los proveedores de medición que autoriza. Puede retirar su permiso desde el pie de página. Los eventos disponibles son `quote_start` y `whatsapp_click`, con parámetros UTM de campaña cuando corresponda. El clic mide intención de contacto.

Si habilitás medición, desactivá en GA4 la captura automática de enlaces salientes y formularios, y en Meta la detección automática de eventos y la coincidencia avanzada. Probá en una propiedad de prueba que los eventos lleguen con las UTM autorizadas y sin datos del formulario. Usá etiquetas UTM sin datos personales.

## Ilustraciones del catálogo y fuentes adicionales

Omint, SanCor Salud y Avalian usan los logos aportados. DoctoRed aparece con su nombre hasta contar con un logo identificado. Los folletos de referencia están enlazados en el catálogo. Las familias de Omint se documentan en sus [planes](https://www.omint.com.ar/PlanDeSalud/Planes/OmintVos) y en su [tabla de líneas y cartillas](https://www.omint.com.ar/website2/Portals/0/Formato_sanatorios-2014_v12.pdf). Los cuadros públicos de DoctoRed detallan los planes [500](https://cdn.doctored.com.ar/app-institucional/alcance_cobertura/500.pdf), [2000](https://www.doctored.com.ar/_files/ugd/ebb200_36343385e8fc4d2ba3532bd50cdad62d.pdf) y [3000](https://cdn.doctored.com.ar/app-institucional/alcance_cobertura/3000.pdf).

Para el Clásico 6500, las prestaciones de internación y odontología corresponden a la [ficha oficial 6500_21](https://www.omint.com.ar/OmintPlanes/Beneficios.html?CondSocio=E&Plan=6500_21).


