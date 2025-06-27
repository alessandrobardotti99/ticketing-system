import * as React from 'react';

interface TicketAssignedTemplateProps {
  assigneeName: string;
  creatorName: string;
  ticketTitle: string;
  ticketDescription: string;
  ticketId: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  statusLabel: string;
  statusColor: string;
  createdAt: string;
  projectName?: string;
  baseUrl: string;
  logoUrl: string;
}

export function TicketAssignedTemplate({
  assigneeName,
  creatorName,
  ticketTitle,
  ticketDescription,
  ticketId,
  priority,
  statusLabel,
  statusColor,
  createdAt,
  projectName,
  baseUrl,
  logoUrl
}: TicketAssignedTemplateProps) {
  const priorityColors = {
    urgent: '#dc2626',
    high: '#ea580c',
    medium: '#ca8a04',
    low: '#16a34a'
  };

  const priorityLabels = {
    urgent: 'URGENTE',
    high: 'ALTA',
    medium: 'MEDIA',
    low: 'BASSA'
  };

  const formattedDate = new Date(createdAt).toLocaleString('it-IT', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <html lang="it">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Ticket Assegnato</title>
      </head>
      <body style={{
        margin: 0,
        padding: 0,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        backgroundColor: '#f5f5f5'
      }}>
        <div style={{
          maxWidth: '600px',
          margin: '0 auto',
          backgroundColor: '#ffffff'
        }}>
          
          {/* Header */}
          <div style={{
            backgroundColor: '#666666',
            padding: '40px 30px',
            textAlign: 'center',
            borderBottom: '3px solid #e5e5e5'
          }}>
            <img 
              src={logoUrl} 
              alt="Logo" 
              style={{
                height: '40px',
                marginBottom: '20px'
              }}
            />
            <h1 style={{
              color: '#ffffff',
              margin: 0,
              fontSize: '24px',
              fontWeight: 600,
              letterSpacing: '-0.5px'
            }}>
              Nuovo Ticket Assegnato
            </h1>
          </div>

          {/* Content */}
          <div style={{ padding: '40px 30px' }}>
            <p style={{
              color: '#121212',
              fontSize: '16px',
              lineHeight: 1.6,
              margin: '0 0 25px 0'
            }}>
              Gentile <strong>{assigneeName}</strong>,
            </p>
            
            <p style={{
              color: '#666666',
              fontSize: '14px',
              lineHeight: 1.6,
              margin: '0 0 30px 0'
            }}>
              Ti è stato assegnato un nuovo ticket da <strong>{creatorName}</strong>. Si prega di prendere in carico la richiesta secondo le priorità stabilite.
            </p>

            {/* Ticket Info Box */}
            <div style={{
              backgroundColor: '#f9f9f9',
              borderLeft: '4px solid #666666',
              padding: '25px',
              margin: '30px 0'
            }}>
              <h2 style={{
                color: '#121212',
                fontSize: '20px',
                fontWeight: 600,
                margin: '0 0 15px 0',
                lineHeight: 1.3
              }}>
                {ticketTitle}
              </h2>
              <p style={{
                color: '#666666',
                fontSize: '14px',
                lineHeight: 1.6,
                margin: 0
              }}>
                <strong>Descrizione:</strong><br />
                {ticketDescription}
              </p>
            </div>

            {/* Details Table */}
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              margin: '30px 0'
            }}>
              <tbody>
                <tr>
                  <td style={{
                    padding: '15px',
                    border: '1px solid #e5e5e5',
                    backgroundColor: '#ffffff',
                    width: '50%',
                    verticalAlign: 'top'
                  }}>
                    <p style={{
                      margin: 0,
                      fontSize: '12px',
                      color: '#666666',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      fontWeight: 500
                    }}>
                      Priorità
                    </p>
                    <p style={{
                      margin: '5px 0 0 0',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: priorityColors[priority]
                    }}>
                      {priorityLabels[priority]}
                    </p>
                  </td>
                  <td style={{
                    padding: '15px',
                    border: '1px solid #e5e5e5',
                    backgroundColor: '#ffffff',
                    width: '50%',
                    verticalAlign: 'top'
                  }}>
                    <p style={{
                      margin: 0,
                      fontSize: '12px',
                      color: '#666666',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      fontWeight: 500
                    }}>
                      Status Iniziale
                    </p>
                    <p style={{
                      margin: '5px 0 0 0',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: statusColor || '#121212'
                    }}>
                      {statusLabel}
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style={{
                    padding: '15px',
                    border: '1px solid #e5e5e5',
                    backgroundColor: '#ffffff',
                    verticalAlign: 'top'
                  }}>
                    <p style={{
                      margin: 0,
                      fontSize: '12px',
                      color: '#666666',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      fontWeight: 500
                    }}>
                      Creato da
                    </p>
                    <p style={{
                      margin: '5px 0 0 0',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#121212'
                    }}>
                      {creatorName}
                    </p>
                  </td>
                  <td style={{
                    padding: '15px',
                    border: '1px solid #e5e5e5',
                    backgroundColor: '#ffffff',
                    verticalAlign: 'top'
                  }}>
                    <p style={{
                      margin: 0,
                      fontSize: '12px',
                      color: '#666666',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      fontWeight: 500
                    }}>
                      ID Ticket
                    </p>
                    <p style={{
                      margin: '5px 0 0 0',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#121212',
                      fontFamily: 'monospace'
                    }}>
                      {ticketId}
                    </p>
                  </td>
                </tr>
                
                {projectName && (
                  <tr>
                    <td colSpan={2} style={{
                      padding: '15px',
                      border: '1px solid #e5e5e5',
                      backgroundColor: '#ffffff',
                      verticalAlign: 'top'
                    }}>
                      <p style={{
                        margin: 0,
                        fontSize: '12px',
                        color: '#666666',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        fontWeight: 500
                      }}>
                        Progetto
                      </p>
                      <p style={{
                        margin: '5px 0 0 0',
                        fontSize: '14px',
                        fontWeight: 600,
                        color: '#121212'
                      }}>
                        {projectName}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Metadata */}
            <div style={{
              backgroundColor: '#f9f9f9',
              padding: '20px',
              border: '1px solid #e5e5e5',
              margin: '30px 0'
            }}>
              <p style={{
                margin: '0 0 8px 0',
                fontSize: '13px',
                color: '#666666'
              }}>
                <strong>Data e Ora Assegnazione:</strong> {formattedDate}
              </p>
            </div>

            {/* Call to Action */}
            <div style={{
              textAlign: 'center',
              margin: '40px 0'
            }}>
              <a 
                href={`${baseUrl}/dashboard/tickets/${ticketId}`}
                style={{
                  display: 'inline-block',
                  backgroundColor: '#666666',
                  color: '#ffffff',
                  padding: '15px 40px',
                  textDecoration: 'none',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  fontSize: '14px',
                  border: '2px solid #666666'
                }}
              >
                INIZIA LAVORAZIONE
              </a>
            </div>

            <p style={{
              color: '#666666',
              fontSize: '13px',
              lineHeight: 1.5,
              margin: '30px 0 0 0'
            }}>
              Cordiali saluti,<br />
              <strong>Il Team di Supporto</strong>
            </p>
          </div>

          {/* Footer */}
          <div style={{
            backgroundColor: '#f9f9f9',
            padding: '25px 30px',
            borderTop: '1px solid #e5e5e5',
            textAlign: 'center'
          }}>
            <p style={{
              margin: 0,
              fontSize: '12px',
              color: '#666666',
              lineHeight: 1.4
            }}>
              Ha ricevuto questa email perché le è stato assegnato un ticket.<br />
              Per qualsiasi problema tecnico, contatti il supporto.
            </p>
          </div>
        </div>
      </body>
    </html>
  );
}