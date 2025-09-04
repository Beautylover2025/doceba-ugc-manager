'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ConsentPage() {
  const [hasConsent, setHasConsent] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const supabase = createClientComponentClient();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    checkConsent();
  }, []);

  const checkConsent = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      // Prüfe localStorage (beide Formate unterstützen)
      const consentKey = `consent_${user.id}`;
      const hasLocalConsent = localStorage.getItem(consentKey) === 'true' || 
                              localStorage.getItem('consent_v1') === 'true';
      
      if (hasLocalConsent) {
        setHasConsent(true);
        setIsLoading(false);
        return;
      }

      // Fallback: Versuche Datenbank-Abfrage
      try {
        const { data, error } = await supabase
          .from('consents')
          .select('*')
          .eq('creator_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.log('Consents table not available, using localStorage fallback');
          setHasConsent(false);
        } else {
          setHasConsent(!!data);
        }
      } catch (dbError) {
        console.log('Database consent check failed, using localStorage fallback');
        setHasConsent(false);
      }
    } catch (error) {
      console.error('Error checking consent:', error);
      setHasConsent(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConsentAgreement = async () => {
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      // 1. Versuche zuerst RPC accept_consent aufzurufen
      const { error } = await supabase.rpc('accept_consent', { 
        p_version: 'v1', 
        p_program: null, 
        p_type: 'upload', 
        p_ip_hash: null 
      });

      if (!error) {
        // Erfolg: RPC funktioniert
        toast({ title: 'Einwilligung gespeichert' });
        setHasConsent(true);
        router.push('/upload/1');
        return;
      }

      // 2. Bei Fehlern: Prüfe ob es ein Tabellen-Problem ist
      const errorMessage = error.message || '';
      if (errorMessage.includes('relation "consents" does not exist') || 
          errorMessage.includes('PGRST116')) {
        // Fallback: localStorage verwenden
        localStorage.setItem('consent_v1', 'true');
        toast({ 
          title: 'Einwilligung lokal gespeichert', 
          description: 'Die Einwilligung wurde lokal gespeichert, da die Datenbanktabelle noch nicht verfügbar ist.',
          variant: 'default'
        });
        setHasConsent(true);
        router.push('/upload/1');
        return;
      }

      // 3. Andere Fehler: Zeige Fehlermeldung
      toast({ 
        title: 'Einwilligung konnte nicht gespeichert werden', 
        description: 'Bitte versuche es erneut oder wende dich an den Support.',
        variant: 'destructive' 
      });

    } catch (error) {
      console.error('Error handling consent:', error);
      toast({ 
        title: 'Einwilligung konnte nicht gespeichert werden', 
        description: 'Ein unerwarteter Fehler ist aufgetreten.',
        variant: 'destructive' 
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Lade...</p>
        </div>
      </main>
    );
  }

  if (hasConsent) {
    return (
      <main className="min-h-screen bg-gradient-subtle">
        <div className="w-full max-w-3xl mx-auto px-4 py-10">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl">Einwilligung bereits erteilt</CardTitle>
              <p className="text-sm text-muted-foreground">
                Du hast bereits der Nutzung deiner Bilder zugestimmt.
              </p>
            </CardHeader>
            <CardContent className="text-center">
              <Button onClick={() => router.push('/upload/1')} className="w-full">
                Zur Upload-Seite
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-subtle">
      <div className="w-full max-w-3xl mx-auto px-4 py-10">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <Shield className="w-6 h-6 text-primary" />
              <CardTitle className="text-2xl">Einwilligung & Nutzungsbedingungen</CardTitle>
            </div>
            <p className="text-sm text-muted-foreground">
              Um Fotos hochladen zu können, musst du zuerst der Nutzung deiner Bilder zustimmen.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="prose prose-sm max-w-none">
              <h3 className="text-lg font-semibold mb-3">Verwendung deiner Fotos</h3>
              <p className="text-muted-foreground mb-4">
                Deine Fotos werden für die Analyse deines Fortschritts verwendet und sicher gespeichert. 
                Sie helfen uns dabei, deine Entwicklung zu verfolgen und dir personalisierte Empfehlungen zu geben.
              </p>
              
              <h3 className="text-lg font-semibold mb-3">Speicherung & Sicherheit</h3>
              <p className="text-muted-foreground mb-4">
                Alle Bilder werden verschlüsselt gespeichert und sind nur für dich und das SuperUGC-Team zugänglich. 
                Wir verwenden deine Daten ausschließlich für die Zwecke dieses Programms.
              </p>
              
              <h3 className="text-lg font-semibold mb-3">Widerruf</h3>
              <p className="text-muted-foreground mb-6">
                Du kannst deine Einwilligung jederzeit widerrufen, indem du dich an unser Support-Team wendest. 
                Nach dem Widerruf werden deine Bilder gelöscht und nicht weiter verwendet.
              </p>
            </div>



            <Button 
              onClick={handleConsentAgreement} 
              disabled={isSaving}
              className="w-full"
              size="lg"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Speichere...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4 mr-2" />
                  Einverstanden
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
