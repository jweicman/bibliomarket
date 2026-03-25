// src/lib/oca.ts
/**
 * Integración con OCA e-Pak
 * API SOAP de OCA Argentina
 * Documentación: https://www.oca.com.ar/ocaepak
 */

const OCA_WS_URL = 'https://webservice.oca.com.ar/oepak/wsOEPak.asmx'
const OCA_WS_TARIFAS = 'https://webservice.oca.com.ar/ORoma/WebService.asmx'

interface OCAShippingRate {
  idTipoServicio: string
  descripcion: string
  precio: number
  plazo: number // days
}

interface OCAOrderParams {
  cuentaCorreo: string
  operativa: string
  origen: {
    calle: string
    numero: string
    piso?: string
    depto?: string
    cp: string
    localidad: string
    provincia: string
    contacto: string
    email: string
    telefono: string
  }
  destino: {
    calle: string
    numero: string
    piso?: string
    depto?: string
    cp: string
    localidad: string
    provincia: string
    contacto: string
    email: string
    telefono: string
  }
  paquete: {
    alto: number  // cm
    ancho: number // cm
    largo: number // cm
    peso: number  // kg
    valorDeclarado: number
  }
  referencias: {
    nroRemito: string
    descripcion: string
  }
}

/**
 * Obtiene tarifas de envío OCA entre dos códigos postales
 */
export async function getOCARate(
  cpOrigen: string,
  cpDestino: string,
  peso: number = 1,
  volumen: number = 8000, // cm³ (20x20x20 default)
): Promise<OCAShippingRate[]> {
  const xmlBody = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
               xmlns:xsd="http://www.w3.org/2001/XMLSchema" 
               xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <Tarifar_Envio_Corporativo xmlns="http://tempuri.org/">
      <PesoTotal>${peso}</PesoTotal>
      <VolumenTotal>${volumen}</VolumenTotal>
      <CodigoPostalOrigen>${cpOrigen}</CodigoPostalOrigen>
      <CodigoPostalDestino>${cpDestino}</CodigoPostalDestino>
      <CantidadPaquetes>1</CantidadPaquetes>
      <Operativa>${process.env.OCA_OPERATIVA}</Operativa>
      <Cuit>${process.env.OCA_CUIT || ''}</Cuit>
    </Tarifar_Envio_Corporativo>
  </soap:Body>
</soap:Envelope>`

  try {
    const response = await fetch(OCA_WS_TARIFAS, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        SOAPAction: '"http://tempuri.org/Tarifar_Envio_Corporativo"',
      },
      body: xmlBody,
    })

    if (!response.ok) {
      throw new Error(`OCA API error: ${response.status}`)
    }

    const text = await response.text()
    // Parse XML response - in production use 'fast-xml-parser'
    // Simplified for demo:
    const tarifas = parseOCATarifas(text)
    return tarifas
  } catch (error) {
    console.error('Error consultando tarifas OCA:', error)
    // Return estimated rates if API fails
    return [
      { idTipoServicio: '1', descripcion: 'OCA e-Pak Puerta a Puerta', precio: 3500, plazo: 5 },
      { idTipoServicio: '2', descripcion: 'OCA e-Pak a Sucursal', precio: 2800, plazo: 7 },
    ]
  }
}

function parseOCATarifas(xml: string): OCAShippingRate[] {
  // Simplified XML parsing - in production use a proper XML parser
  const matches = xml.match(/<Precio>([\d.]+)<\/Precio>/g) || []
  const plazoMatches = xml.match(/<Plazo>([\d]+)<\/Plazo>/g) || []
  
  return matches.map((m, i) => ({
    idTipoServicio: String(i + 1),
    descripcion: i === 0 ? 'OCA e-Pak Puerta a Puerta' : 'OCA e-Pak a Sucursal',
    precio: parseFloat(m.replace(/<\/?Precio>/g, '')),
    plazo: parseInt(plazoMatches[i]?.replace(/<\/?Plazo>/g, '') || '5'),
  }))
}

/**
 * Genera una guía de envío OCA (ingresa el pedido al sistema)
 */
export async function createOCAShipment(params: OCAOrderParams): Promise<{
  success: boolean
  guideNumber?: string
  error?: string
}> {
  const xmlBody = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
               xmlns:xsd="http://www.w3.org/2001/XMLSchema" 
               xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <IngresoOR xmlns="http://tempuri.org/">
      <usr>${process.env.OCA_USERNAME}</usr>
      <psw>${process.env.OCA_PASSWORD}</psw>
      <Cuenta>${params.cuentaCorreo}</Cuenta>
      <Operativa>${params.operativa}</Operativa>
      <Origen_Calle>${params.origen.calle}</Origen_Calle>
      <Origen_Numero>${params.origen.numero}</Origen_Numero>
      <Origen_Piso>${params.origen.piso || ''}</Origen_Piso>
      <Origen_Depto>${params.origen.depto || ''}</Origen_Depto>
      <Origen_CodigoPostal>${params.origen.cp}</Origen_CodigoPostal>
      <Origen_Localidad>${params.origen.localidad}</Origen_Localidad>
      <Origen_Provincia>${params.origen.provincia}</Origen_Provincia>
      <Origen_Contacto>${params.origen.contacto}</Origen_Contacto>
      <Origen_Email>${params.origen.email}</Origen_Email>
      <Origen_Celular>${params.origen.telefono}</Origen_Celular>
      <Destino_Calle>${params.destino.calle}</Destino_Calle>
      <Destino_Numero>${params.destino.numero}</Destino_Numero>
      <Destino_Piso>${params.destino.piso || ''}</Destino_Piso>
      <Destino_Depto>${params.destino.depto || ''}</Destino_Depto>
      <Destino_CodigoPostal>${params.destino.cp}</Destino_CodigoPostal>
      <Destino_Localidad>${params.destino.localidad}</Destino_Localidad>
      <Destino_Provincia>${params.destino.provincia}</Destino_Provincia>
      <Destino_Contacto>${params.destino.contacto}</Destino_Contacto>
      <Destino_Email>${params.destino.email}</Destino_Email>
      <Destino_Celular>${params.destino.telefono}</Destino_Celular>
      <Paquete_Cantidad>1</Paquete_Cantidad>
      <Paquete_Peso>${params.paquete.peso}</Paquete_Peso>
      <Paquete_Alto>${params.paquete.alto}</Paquete_Alto>
      <Paquete_Ancho>${params.paquete.ancho}</Paquete_Ancho>
      <Paquete_Largo>${params.paquete.largo}</Paquete_Largo>
      <Paquete_ValorDeclarado>${params.paquete.valorDeclarado}</Paquete_ValorDeclarado>
      <Referencias_NroRemito>${params.referencias.nroRemito}</Referencias_NroRemito>
      <Referencias_Descripcion>${params.referencias.descripcion}</Referencias_Descripcion>
    </IngresoOR>
  </soap:Body>
</soap:Envelope>`

  try {
    const response = await fetch(OCA_WS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        SOAPAction: '"http://tempuri.org/IngresoOR"',
      },
      body: xmlBody,
    })

    if (!response.ok) throw new Error('OCA API error')

    const text = await response.text()
    const guideMatch = text.match(/<NroGuia>([\d]+)<\/NroGuia>/)
    
    if (guideMatch) {
      return { success: true, guideNumber: guideMatch[1] }
    }
    
    return { success: false, error: 'No se pudo obtener número de guía' }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

/**
 * Consulta el estado de un envío OCA por número de guía
 */
export async function trackOCAShipment(guideNumber: string) {
  const url = `https://www.oca.com.ar/ocaepak/TrackingWebSite/trackingDTE.asp?numero_guia=${guideNumber}`
  
  try {
    const response = await fetch(url)
    const text = await response.text()
    // Parse tracking events from response
    return { success: true, trackingUrl: url, events: [] }
  } catch {
    return { success: false, trackingUrl: url }
  }
}

export function getOCATrackingUrl(guideNumber: string): string {
  return `https://www.oca.com.ar/ocaepak/TrackingWebSite/trackingDTE.asp?numero_guia=${guideNumber}`
}
