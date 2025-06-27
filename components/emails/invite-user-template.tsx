import * as React from 'react';

interface InviteUserTemplateProps {
    userName: string;
    invitedEmail: string;
    projectName: string;
    inviterName: string;
    inviteLink: string;
    projectId: string;
    baseUrl: string;
    logoUrl: string;
}

export function InviteUserTemplate({
    userName,
    projectName,
    inviterName,
    inviteLink,
    projectId,
    logoUrl,
}: InviteUserTemplateProps)
{
    return (
        <html lang="it">
            <head>
                <meta charSet="UTF-8" />
                <title>Invito al progetto</title>
            </head>
            <body style={{
                margin: 0,
                padding: 0,
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                backgroundColor: '#f5f5f5'
            }}>
                <div style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: '#ffffff' }}>

                    {/* Header */}
                    <div style={{
                        backgroundColor: '#666666',
                        padding: '40px 30px',
                        textAlign: 'center',
                        borderBottom: '3px solid #e5e5e5'
                    }}>
                        <img src={logoUrl} alt="Logo" style={{ height: '40px', marginBottom: '20px' }} />
                        <h1 style={{
                            color: '#ffffff',
                            margin: 0,
                            fontSize: '24px',
                            fontWeight: 600,
                            letterSpacing: '-0.5px'
                        }}>
                            Sei stato invitato a un progetto
                        </h1>
                    </div>

                    {/* Content */}
                    <div style={{ padding: '40px 30px' }}>
                        <p style={{
                            fontSize: '16px',
                            color: '#121212',
                            lineHeight: 1.6,
                            margin: '0 0 25px 0'
                        }}>
                            Ciao <strong>{userName}</strong>,
                        </p>

                        <p style={{
                            fontSize: '14px',
                            color: '#666666',
                            lineHeight: 1.6,
                            margin: '0 0 25px 0'
                        }}>
                            <strong>{inviterName}</strong> ti ha invitato a partecipare al progetto <strong>{projectName}</strong>.
                        </p>

                        {/* Project Box */}
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
                                margin: 0
                            }}>
                                {projectName}
                            </h2>
                            <p style={{
                                margin: '10px 0 0 0',
                                color: '#999999',
                                fontSize: '14px'
                            }}>
                                Project ID: <code style={{ fontFamily: 'monospace' }}>{projectId}</code>
                            </p>
                        </div>

                        {/* CTA */}
                        <div style={{
                            textAlign: 'center',
                            margin: '40px 0'
                        }}>
                            <a
                                href={inviteLink}
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
                                Accetta invito
                            </a>

                        </div>

                        <p style={{
                            fontSize: '13px',
                            color: '#666666',
                            lineHeight: 1.6
                        }}>
                            Se non ti aspettavi questo invito, puoi ignorare questa email.
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
                            Questa email è stata inviata automaticamente dal sistema di gestione progetti.<br />
                            Per assistenza, contatta il tuo amministratore.
                        </p>
                    </div>
                </div>
            </body>
        </html>
    );
}
