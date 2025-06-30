// components/emails/verify-email.tsx
import * as React from 'react';
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Heading,
  Button,
  Link,
  Hr,
  Tailwind,
} from '@react-email/components';

// ✅ INTERFACCIA CORRETTA per il template di verifica email
interface VerifyEmailProps {
  username: string;
  userEmail: string;
  verifyUrl: string; // ← Questa deve essere verifyUrl, non resetUrl
}

const VerifyEmail = ({ username, userEmail, verifyUrl }: VerifyEmailProps) => {
  return (
    <Html lang="it" dir="ltr">
      <Tailwind>
        <Head />
        <Body className="bg-gray-100 font-sans py-[40px]">
          <Container className="bg-white max-w-[600px] mx-auto rounded-[10px] overflow-hidden">
            {/* Header Section */}
            <Section className="px-[40px] py-[32px] text-center" style={{ backgroundColor: '#121212' }}>
              <Heading className="text-white text-[28px] font-bold m-0 mb-[8px]">
                Benvenuto in Index! 🎉
              </Heading>
              <Text className="text-white text-[16px] m-0">
                Verifica la tua email per completare la registrazione
              </Text>
            </Section>

            {/* Main Content */}
            <Section className="px-[40px] py-[32px]">
              <Text className="text-gray-800 text-[16px] leading-[24px] mb-[24px]">
                Ciao {username}!
              </Text>
              
              <Text className="text-gray-800 text-[16px] leading-[24px] mb-[24px]">
                Grazie per esserti registrato su Index! Per completare la creazione del tuo account 
                e iniziare a utilizzare tutti i nostri servizi, devi verificare il tuo indirizzo email <strong>{userEmail}</strong>.
              </Text>

              <Text className="text-gray-800 text-[16px] leading-[24px] mb-[32px]">
                Clicca sul pulsante qui sotto per verificare la tua email e attivare immediatamente il tuo account.
              </Text>

              {/* Verification Button */}
              <Section className="text-center mb-[32px]">
                <Button
                  href={verifyUrl}
                  className="text-white px-[32px] py-[16px] rounded-[10px] text-[16px] font-semibold no-underline box-border"
                  style={{ backgroundColor: '#121212' }}
                >
                  Verifica il Mio Account
                </Button>
              </Section>

              {/* Alternative Link */}
              <Section className="bg-gray-50 p-[24px] rounded-[8px] mb-[24px]">
                <Text className="text-gray-800 text-[14px] leading-[20px] mb-[12px] font-semibold">
                  Il pulsante non funziona?
                </Text>
                <Text className="text-gray-700 text-[14px] leading-[20px] mb-[12px]">
                  Copia e incolla questo link nel tuo browser:
                </Text>
                <Link 
                  href={verifyUrl}
                  style={{ color: '#121212' }}
                  className="text-[14px] underline break-all"
                >
                  {verifyUrl}
                </Link>
              </Section>

              <Text className="text-gray-800 text-[16px] leading-[24px] mb-[16px]">
                <strong>⏰ Importante:</strong> Questo link di verifica scadrà tra 24 ore per motivi di sicurezza.
              </Text>

              <Text className="text-gray-800 text-[16px] leading-[24px] mb-[24px]">
                Se non hai richiesto questa registrazione, puoi ignorare questa email in sicurezza. 
                Il tuo account non verrà creato senza la verifica.
              </Text>

              <Text className="text-gray-800 text-[16px] leading-[24px]">
                Hai domande? Siamo qui per aiutarti! Contattaci a{' '}
                <Link 
                  href={`mailto:support@index-ticketing.com`}
                  style={{ color: '#121212' }}
                  className="underline font-semibold"
                >
                  support@index-ticketing.com
                </Link>
              </Text>
            </Section>

            <Hr className="border-gray-200 my-[32px]" />

            {/* Footer */}
            <Section className="px-[40px] pb-[32px]">
              <Text className="text-gray-500 text-[14px] text-center m-0 mb-[16px]">
                © 2024 Index Team. Tutti i diritti riservati.
              </Text>
              <Text className="text-gray-500 text-[14px] text-center m-0 mb-[8px]">
                La piattaforma di ticketing che semplifica la gestione dei tuoi progetti.
              </Text>
              <Text className="text-gray-500 text-[14px] text-center m-0">
                <Link 
                  href={`https://index-ticketing.com/privacy`} 
                  className="text-gray-500 underline"
                >
                  Privacy Policy
                </Link>
                {' | '}
                <Link 
                  href={`https://index-ticketing.com/terms`} 
                  className="text-gray-500 underline"
                >
                  Termini di Servizio
                </Link>
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

// Preview props per il testing
VerifyEmail.PreviewProps = {
  username: "Mario Rossi",
  userEmail: "mario.rossi@email.com",
  verifyUrl: "https://index-ticketing.com/api/auth/verify-email?token=abc123xyz789&callbackURL=/dashboard",
};

export default VerifyEmail;