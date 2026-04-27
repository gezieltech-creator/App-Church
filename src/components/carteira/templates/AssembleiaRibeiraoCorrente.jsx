import { formatarData, formatarCPF } from '../../../utils/formatters'

const ROLE_LABEL = {
  super_admin: 'Administrador Geral',
  admin: 'Administrador',
  lideranca: 'Liderança',
  membro: 'Membro',
  visitante: 'Visitante',
}

const CARD_STYLE = {
  background: '#1e3a5f',
  borderRadius: '16px',
  overflow: 'hidden',
  boxShadow: '0 12px 40px rgba(0,0,0,0.45)',
}

const LINHA_DOURADA = (
  <div style={{ height: '2px', background: 'linear-gradient(90deg, #d97706, #fbbf24, #d97706)' }} />
)

const FAIXA_INTERMEDIARIA = ({ nome }) => (
  <div style={{ padding: '0 16px 16px' }}>
    <div style={{ background: '#0f2440', borderRadius: '8px', padding: '10px 12px', textAlign: 'center' }}>
      <p style={{ fontSize: '9px', color: '#93c5fd', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>
        Identidade de Membro — {nome ?? 'Igreja Evangélica Assembleia de Deus'}
      </p>
    </div>
  </div>
)

export function Verso({ qrUrl, igreja }) {
  const cidadeEstado = [igreja?.endereco_cidade, igreja?.endereco_estado].filter(Boolean).join(' / ')

  return (
    <div style={CARD_STYLE}>
      {/* Topo */}
      <div style={{ background: '#0f2440', padding: '20px 16px', textAlign: 'center' }}>
        <p style={{ fontSize: '10px', color: '#93c5fd', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>
          Igreja Evangélica Assembleia de Deus
        </p>
        <p style={{ fontSize: '14px', color: 'white', fontWeight: 'bold', marginTop: '3px', wordBreak: 'break-word' }}>
          {igreja?.nome ?? ''}
        </p>
      </div>

      {LINHA_DOURADA}

      {/* QR Code */}
      <div style={{ padding: '24px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
        <div style={{ background: 'white', padding: '14px', borderRadius: '12px' }}>
          <img src={qrUrl} alt="QR Code" style={{ width: '150px', height: '150px', display: 'block' }} />
        </div>
        <p style={{ fontSize: '11px', color: 'white', fontStyle: 'italic', opacity: 0.7, textAlign: 'center', margin: 0 }}>
          Documento válido apenas com foto
        </p>
      </div>

      <FAIXA_INTERMEDIARIA nome={igreja?.nome} />

      {/* Rodapé */}
      <div style={{ background: '#0f2440', padding: '14px 16px', textAlign: 'center' }}>
        {cidadeEstado && (
          <p style={{ fontSize: '10px', color: '#93c5fd', margin: 0 }}>{cidadeEstado}</p>
        )}
      </div>
    </div>
  )
}

export default function AssembleiaRibeiraoCorrente({ membro, igreja }) {
  const funcaoLabel = membro.funcao?.trim() || ROLE_LABEL[membro.role] || membro.role
  const cpfFormatado = membro.cpf
    ? formatarCPF(membro.cpf.replace(/\D/g, '').padEnd(11, '0').slice(0, 11))
    : null

  const dataNasc = membro.data_nascimento ? formatarData(membro.data_nascimento) : 'Não informado'
  const dataMembro = membro.data_membresia ? formatarData(membro.data_membresia) : 'Não informado'

  const nomeIniciais = igreja?.nome
    ? igreja.nome.split(' ').filter(w => w.length > 2).slice(0, 2).map(w => w[0]).join('').toUpperCase()
    : 'AD'

  const membroIniciais = membro.nome_completo
    ? membro.nome_completo.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : '?'

  return (
    <div style={CARD_STYLE}>
      {/* ─── TOPO ─── */}
      <div style={{
        background: '#0f2440',
        padding: '20px 16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '12px',
      }}>
        {/* Esquerdo: nome da igreja */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: '10px', color: '#93c5fd', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>
            Igreja Evangélica
          </p>
          <p style={{ fontSize: '13px', color: 'white', fontWeight: 'bold', marginTop: '3px', wordBreak: 'break-word' }}>
            {igreja?.nome ?? ''}
          </p>
          {(igreja?.endereco_cidade || igreja?.endereco_estado) && (
            <p style={{ fontSize: '10px', color: '#93c5fd', marginTop: '5px', marginBottom: 0 }}>
              {[igreja.endereco_cidade, igreja.endereco_estado].filter(Boolean).join(' / ')}
            </p>
          )}
        </div>

        {/* Direito: logo */}
        <div style={{
          width: '90px',
          height: '90px',
          borderRadius: '12px',
          background: 'white',
          flexShrink: 0,
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {igreja?.logo_url ? (
            <img
              src={igreja.logo_url}
              alt="Logo"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                transform: 'scale(1.5)',
                transformOrigin: 'center',
              }}
            />
          ) : (
            <span style={{ fontSize: '22px', fontWeight: 'bold', color: '#1e3a5f' }}>{nomeIniciais}</span>
          )}
        </div>
      </div>

      {LINHA_DOURADA}

      {/* ─── ÁREA CENTRAL ─── */}
      <div style={{ padding: '20px 16px', display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
        {/* Foto */}
        <div style={{
          width: '100px',
          height: '130px',
          borderRadius: '12px',
          border: '3px solid white',
          overflow: 'hidden',
          flexShrink: 0,
        }}>
          {membro.foto_carteira_url ? (
            <img
              src={membro.foto_carteira_url}
              alt={membro.nome_completo}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <div style={{
              width: '100%',
              height: '100%',
              background: '#2d5a8e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <span style={{ fontSize: '28px', fontWeight: 'bold', color: '#93c5fd' }}>{membroIniciais}</span>
            </div>
          )}
        </div>

        {/* Dados */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: '15px', color: 'white', fontWeight: 'bold', wordBreak: 'break-word', margin: 0 }}>
            {membro.nome_completo}
          </p>
          <p style={{ fontSize: '11px', color: '#fbbf24', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '3px', marginBottom: 0 }}>
            {funcaoLabel}
          </p>

          {/* Box de dados */}
          <div style={{ background: '#0f2440', borderRadius: '8px', padding: '10px', marginTop: '10px' }}>
            <div>
              <p style={{ fontSize: '8px', color: '#93c5fd', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>Nascimento</p>
              <p style={{ fontSize: '11px', color: 'white', marginTop: '1px', marginBottom: 0 }}>{dataNasc}</p>
            </div>
            <div style={{ height: '0.5px', background: '#1e3a5f', margin: '6px 0' }} />
            <div>
              <p style={{ fontSize: '8px', color: '#93c5fd', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>Membro desde</p>
              <p style={{ fontSize: '11px', color: 'white', marginTop: '1px', marginBottom: 0 }}>{dataMembro}</p>
            </div>
            <div style={{ height: '0.5px', background: '#1e3a5f', margin: '6px 0' }} />
            <div>
              <p style={{ fontSize: '8px', color: '#93c5fd', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>CPF</p>
              <p style={{ fontSize: '11px', color: 'white', marginTop: '1px', marginBottom: 0, fontFamily: 'monospace' }}>
                {cpfFormatado ?? 'Não informado'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <FAIXA_INTERMEDIARIA nome={igreja?.nome} />

      {/* ─── RODAPÉ ─── */}
      <div style={{
        background: '#0f2440',
        padding: '14px 16px',
        borderTop: '1px solid #1e3a5f',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
      }}>
        {/* Pastor */}
        <div>
          <div style={{ width: '100px', height: '0.5px', background: '#93c5fd', marginBottom: '5px' }} />
          <p style={{ fontSize: '11px', color: 'white', fontWeight: 'bold', margin: 0 }}>
            {igreja?.pastor_nome ?? ''}
          </p>
          <p style={{ fontSize: '9px', color: '#93c5fd', marginTop: '1px', marginBottom: 0 }}>
            {igreja?.pastor_cargo ?? 'Pastor Presidente'}
          </p>
        </div>

        {/* Carteira de Membro */}
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: '9px', color: '#fbbf24', fontWeight: 'bold', textTransform: 'uppercase', margin: 0 }}>Carteira</p>
          <p style={{ fontSize: '9px', color: '#fbbf24', fontWeight: 'bold', textTransform: 'uppercase', margin: 0 }}>de Membro</p>
        </div>
      </div>
    </div>
  )
}
