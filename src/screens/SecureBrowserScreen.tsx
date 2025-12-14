/**
 * SafePhone DR - Secure Browser Screen
 * In-app browser with phishing detection
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Linking } from 'react-native';
import { WebView } from 'react-native-webview';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { useLanguage } from '../context/LanguageContext';
import { RootStackParamList } from '../types';
import { analyzeUrl, getSafeBankingUrls } from '../utils/phishingDetector';
import { verifyBankEmail, BankEmailCheck } from '../utils/bankEmailVerifier';
import { addReportedEmail, addReportedPhone, getReportForPhone, isReportedPhone } from '../utils/reportedIndicators';
import { BANK_CONTACTS_RD } from '../constants/bankContacts';
import { Card } from '../components/Card';
import { PrimaryButton } from '../components/PrimaryButton';
import { GradientHeader } from '../components/GradientHeader';
import { useCallDetection } from '../hooks/useCallDetection';

type SecureBrowserNavigationProp = NativeStackNavigationProp<RootStackParamList, 'SecureBrowser'>;
type SecureBrowserRouteProp = RouteProp<RootStackParamList, 'SecureBrowser'>;

export const SecureBrowserScreen: React.FC = () => {
  const { t } = useLanguage();
  const navigation = useNavigation<SecureBrowserNavigationProp>();
  const route = useRoute<SecureBrowserRouteProp>();
  
  const [url, setUrl] = useState(route.params?.initialUrl || '');
  const [currentUrl, setCurrentUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showBrowser, setShowBrowser] = useState(false);
  const [emailToCheck, setEmailToCheck] = useState('');
  const [emailResult, setEmailResult] = useState<BankEmailCheck | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailChecking, setEmailChecking] = useState(false);
  const [urlToCheck, setUrlToCheck] = useState('');
  const [urlCheckResult, setUrlCheckResult] = useState<{ status: 'unknown' | 'official' | 'typo' | 'invalid'; message: string }>({ status: 'unknown', message: '' });
  const [securityStatus, setSecurityStatus] = useState<{ label: string; color: string; emoji: string }>({
    label: 'Verificando...',
    color: COLORS.gray,
    emoji: 'ℹ️',
  });
  const [reportEmail, setReportEmail] = useState('');
  const [reportPhone, setReportPhone] = useState('');
  const [phoneToCheck, setPhoneToCheck] = useState('');
  const [phoneCheckResult, setPhoneCheckResult] = useState<{ status: 'unknown' | 'reported' | 'clean'; message: string; count?: number }>({ status: 'unknown', message: '' });
  const { incoming, permissionGranted, requestPermission, start } = useCallDetection();
  const webViewRef = useRef<WebView>(null);

  const safeBanks = getSafeBankingUrls();

  useEffect(() => {
    start();
  }, [start]);

  const handleCheckUrl = useCallback(() => {
    if (!url.trim()) return;

    // Ensure URL has protocol
    let fullUrl = url.trim();
    if (!fullUrl.startsWith('http://') && !fullUrl.startsWith('https://')) {
      fullUrl = 'https://' + fullUrl;
    }

    // Analyze URL for phishing
    const analysis = analyzeUrl(fullUrl);

    if (analysis.riskLevel === 'danger' || analysis.riskLevel === 'warning') {
      // Navigate to warning screen
      navigation.navigate('PhishingWarning', {
        url: fullUrl,
        reason: analysis.warningMessage || 'URL sospechosa detectada',
      });
    } else {
      // Safe to browse
      setSecurityStatus({ label: 'Sitio verificado', color: COLORS.safe, emoji: '✓' });
      setCurrentUrl(fullUrl);
      setShowBrowser(true);
    }
  }, [url, navigation]);

  const handleSafeBankPress = (bankUrl: string) => {
    setUrl(bankUrl);
    setCurrentUrl(bankUrl);
    setSecurityStatus({ label: 'Sitio oficial de banco', color: COLORS.safe, emoji: '✓' });
    setShowBrowser(true);
  };

  const handleVerifyEmail = async () => {
    if (!emailToCheck.trim()) {
      setEmailResult(null);
      setEmailError('Ingresa un correo válido');
      return;
    }
    setEmailError(null);
    setEmailChecking(true);
    try {
      const result = await verifyBankEmail(emailToCheck.trim());
      setEmailResult(result);
    } finally {
      setEmailChecking(false);
    }
  };

  const emailStatus = (() => {
    if (!emailResult) return { label: 'Sin verificar', color: COLORS.gray, emoji: 'ℹ️' };
    if (emailResult.isOfficial) return { label: 'Dominio oficial', color: COLORS.safe, emoji: '✓' };
    if (emailResult.isTyposquatting) return { label: 'Posible phishing', color: COLORS.danger, emoji: '🚨' };
    return { label: 'No oficial', color: COLORS.warning, emoji: '⚠️' };
  })();

  const handleVerifyBankUrl = () => {
    if (!urlToCheck.trim()) {
      setUrlCheckResult({ status: 'invalid', message: 'Ingresa una URL' });
      return;
    }
    let input = urlToCheck.trim();
    if (!input.startsWith('http://') && !input.startsWith('https://')) {
      input = 'https://' + input;
    }
    try {
      const hostname = new URL(input).hostname.toLowerCase();
      const official = getSafeBankingUrls().some((b) => hostname.endsWith(new URL(b.url).hostname));
      if (official) {
        setUrlCheckResult({ status: 'official', message: 'Dominio oficial' });
      } else {
        // heurística simple de typo: contiene nombre pero no dominio exacto
        const names = ['banreservas', 'popular', 'bhd', 'scotiabank', 'apap', 'caribe', 'santa', 'bdi', 'acap', 'nacional'];
        const hasName = names.some((n) => hostname.includes(n));
        setUrlCheckResult({
          status: hasName ? 'typo' : 'invalid',
          message: hasName ? 'Posible phishing (dominio similar)' : 'Dominio no oficial',
        });
      }
    } catch (e) {
      setUrlCheckResult({ status: 'invalid', message: 'URL inválida' });
    }
  };

  const handleReportEmail = async () => {
    if (!reportEmail.trim()) {
      Alert.alert('Ingresa un correo sospechoso para reportar.');
      return;
    }
    await addReportedEmail(reportEmail.trim());
    Alert.alert('Guardado', 'Correo reportado como phishing. Gracias por tu ayuda.');
    setReportEmail('');
  };

  const handleReportPhone = async () => {
    if (!reportPhone.trim()) {
      Alert.alert('Ingresa un número sospechoso para reportar.');
      return;
    }
    await addReportedPhone(reportPhone.trim());
    const info = await getReportForPhone(reportPhone.trim());
    const countText = info?.count ? `Reportes: ${info.count}` : '';
    Alert.alert('Guardado', `Número reportado como phishing/llamada sospechosa. ${countText}`.trim());
    setReportPhone('');
  };

  const handleCheckPhone = async () => {
    if (!phoneToCheck.trim()) {
      setPhoneCheckResult({ status: 'unknown', message: '' });
      Alert.alert('Ingresa un número para verificar.');
      return;
    }
    const report = await getReportForPhone(phoneToCheck.trim());
    if (report) {
      setPhoneCheckResult({
        status: 'reported',
        message: 'Reportado por usuarios como phishing/llamada sospechosa',
        count: report.count,
      });
    } else {
      setPhoneCheckResult({ status: 'clean', message: 'No está reportado por otros usuarios' });
    }
  };

  const handleGoBack = () => {
    if (webViewRef.current) {
      webViewRef.current.goBack();
    }
  };

  const handleCloseBrowser = () => {
    setShowBrowser(false);
    setCurrentUrl('');
  };

  // Browser mode
  if (showBrowser && currentUrl) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Browser Header */}
        <View style={styles.browserHeader}>
          <TouchableOpacity onPress={handleGoBack} style={styles.browserButton}>
            <Text style={styles.browserButtonText}>←</Text>
          </TouchableOpacity>
          
          <View style={styles.urlBar}>
            <Text style={styles.lockIcon}>🔒</Text>
            <Text style={styles.urlText} numberOfLines={1}>
              {currentUrl}
            </Text>
          </View>
          
          <TouchableOpacity onPress={handleCloseBrowser} style={styles.browserButton}>
            <Text style={styles.browserButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Security indicator */}
        <View style={styles.securityBar}>
          <Text style={[styles.securityText, { color: securityStatus.color }]}>
            {securityStatus.emoji} {securityStatus.label}
          </Text>
        </View>

        {/* WebView */}
        <WebView
          ref={webViewRef}
          source={{ uri: currentUrl }}
          style={styles.webView}
          onLoadStart={() => setIsLoading(true)}
          onLoadEnd={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setSecurityStatus({ label: 'No se pudo cargar (DNS/SSL)', color: COLORS.danger, emoji: '⚠️' });
          }}
          onNavigationStateChange={(navState) => {
            // Check each new URL for phishing - must match initial check logic
            const analysis = analyzeUrl(navState.url);
            if (analysis.riskLevel === 'danger' || analysis.riskLevel === 'warning') {
              handleCloseBrowser();
              navigation.navigate('PhishingWarning', {
                url: navState.url,
                reason: analysis.warningMessage || 'URL sospechosa detectada',
              });
            } else {
              setSecurityStatus({ label: 'Sitio verificado', color: COLORS.safe, emoji: '✓' });
            }
          }}
        />

        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={COLORS.accent} />
          </View>
        )}
      </SafeAreaView>
    );
  }

  // URL input mode
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          {/* Modern Header */}
          <GradientHeader
            title="Navegador Seguro"
            subtitle="Pega el link aquí. Si parece falso (Banco Popular/Banreservas), te avisamos."
            rightSlot={<Text style={styles.headerBadge}>🛡️</Text>}
          />

        {/* Alerta de llamada entrante */}
        {!permissionGranted && (
          <Card style={styles.inputCard}>
            <Text style={styles.inputLabel}>Alertas de llamadas sospechosas</Text>
            <Text style={styles.emailResultDetail}>
              Necesitamos permiso de teléfono para avisarte si una llamada fue reportada como estafa.
            </Text>
            <PrimaryButton
              title="Conceder permiso de teléfono"
              onPress={requestPermission}
              style={styles.checkButton}
            />
          </Card>
        )}

        {incoming.number && (
          <View
            style={[
              styles.callBanner,
              incoming.isReported ? styles.callBannerDanger : styles.callBannerSafe,
            ]}
          >
            <Text style={styles.callBannerTitle}>
              {incoming.isReported ? 'Llamada reportada como estafa' : 'Llamada entrante'}
            </Text>
            <Text style={styles.callBannerNumber}>{incoming.number}</Text>
            {incoming.report?.count ? (
              <Text style={styles.callBannerDetail}>
                Reportes de usuarios: {incoming.report.count}
              </Text>
            ) : (
              <Text style={styles.callBannerDetail}>No hay reportes previos</Text>
            )}
          </View>
        )}

          {/* URL Input */}
          <Card style={styles.inputCard}>
            <Text style={styles.inputLabel}>{t('enterUrl')}</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.urlInput}
                value={url}
                onChangeText={setUrl}
                placeholder="www.bancopopular.com.do"
                placeholderTextColor={COLORS.gray}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
                returnKeyType="go"
                onSubmitEditing={handleCheckUrl}
              />
              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => setUrl('')}
              >
                <Text style={styles.clearButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            <PrimaryButton
              title={t('checkUrl')}
              onPress={handleCheckUrl}
              style={styles.checkButton}
            />
          </Card>

          {/* Email bancario seguro */}
          <Card style={styles.inputCard}>
            <Text style={styles.inputLabel}>Verificar correo bancario RD</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.urlInput}
                value={emailToCheck}
                onChangeText={setEmailToCheck}
                placeholder="soporte@banreservas.com"
                placeholderTextColor={COLORS.gray}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                returnKeyType="done"
                onSubmitEditing={handleVerifyEmail}
              />
              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => {
                  setEmailToCheck('');
                  setEmailResult(null);
                }}
              >
                <Text style={styles.clearButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            {emailError && <Text style={styles.errorText}>{emailError}</Text>}
            <PrimaryButton
              title="Verificar correo"
              onPress={handleVerifyEmail}
              style={styles.checkButton}
              loading={emailChecking}
            />
            {emailResult && (
              <View
                style={[
                  styles.emailResultBox,
                  emailResult.isOfficial ? styles.emailResultSafe : styles.emailResultDanger,
                ]}
              >
                <Text style={[styles.emailStatus, { color: emailStatus.color }]}>
                  {emailStatus.emoji} {emailStatus.label}
                </Text>
                <Text style={styles.emailResultDetail}>
                  {emailResult.domain} · {emailResult.reason}
                </Text>
              </View>
            )}
            <View style={styles.emailEduBox}>
              <Text style={styles.emailEduTitle}>⚠️ Recuerda:</Text>
              <Text style={styles.emailEduText}>
                Tu banco NUNCA pide claves, códigos de token, CVV ni foto de tu cédula por correo,
                llamada o WhatsApp. Si dudas, llama al número oficial del banco.
              </Text>
              <Text style={styles.emailEduText}>
                No compartas: cédula, claves, tokens, CVV, enlaces de SMS ni códigos de “verificación”.
              </Text>
            </View>
          </Card>

          {/* Verificar URL de banco (sin abrir) */}
          <Card style={styles.inputCard}>
            <Text style={styles.inputLabel}>Verificar URL de banco (RD)</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.urlInput}
                value={urlToCheck}
                onChangeText={setUrlToCheck}
                placeholder="https://www.banreservas.com"
                placeholderTextColor={COLORS.gray}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
                returnKeyType="done"
                onSubmitEditing={handleVerifyBankUrl}
              />
              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => {
                  setUrlToCheck('');
                  setUrlCheckResult({ status: 'unknown', message: '' });
                }}
              >
                <Text style={styles.clearButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            <PrimaryButton
              title="Verificar URL"
              onPress={handleVerifyBankUrl}
              style={styles.checkButton}
            />
            {urlCheckResult.status !== 'unknown' && (
              <View
                style={[
                  styles.emailResultBox,
                  urlCheckResult.status === 'official'
                    ? styles.emailResultSafe
                    : urlCheckResult.status === 'typo'
                    ? styles.emailResultDanger
                    : styles.emailResultDanger,
                ]}
              >
                <Text style={styles.emailStatus}>
                  {urlCheckResult.status === 'official' ? '✓ Dominio oficial' : '⚠️ No oficial'}
                </Text>
                <Text style={styles.emailResultDetail}>{urlCheckResult.message}</Text>
              </View>
            )}
          </Card>

          {/* Reportar correos/números sospechosos */}
          <Card style={styles.inputCard}>
            <Text style={styles.inputLabel}>Reportar correo sospechoso</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.urlInput}
                value={reportEmail}
                onChangeText={setReportEmail}
                placeholder="ej: phishing@falso.com"
                placeholderTextColor={COLORS.gray}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                returnKeyType="done"
                onSubmitEditing={handleReportEmail}
              />
              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => setReportEmail('')}
              >
                <Text style={styles.clearButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            <PrimaryButton
              title="Reportar correo"
              onPress={handleReportEmail}
              style={styles.checkButton}
            />
          </Card>

          <Card style={styles.inputCard}>
            <Text style={styles.inputLabel}>Reportar número (llamada/WhatsApp)</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.urlInput}
                value={reportPhone}
                onChangeText={setReportPhone}
                placeholder="ej: +1 809 000 0000"
                placeholderTextColor={COLORS.gray}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="phone-pad"
                returnKeyType="done"
                onSubmitEditing={handleReportPhone}
              />
              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => setReportPhone('')}
              >
                <Text style={styles.clearButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            <PrimaryButton
              title="Reportar número"
              onPress={handleReportPhone}
              style={styles.checkButton}
            />
          </Card>

          {/* Verificar número reportado */}
          <Card style={styles.inputCard}>
            <Text style={styles.inputLabel}>Verificar número reportado</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.urlInput}
                value={phoneToCheck}
                onChangeText={setPhoneToCheck}
                placeholder="ej: +1 809 000 0000"
                placeholderTextColor={COLORS.gray}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="phone-pad"
                returnKeyType="done"
                onSubmitEditing={handleCheckPhone}
              />
              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => setPhoneToCheck('')}
              >
                <Text style={styles.clearButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            <PrimaryButton
              title="Verificar número"
              onPress={handleCheckPhone}
              style={styles.checkButton}
            />
            {phoneCheckResult.status !== 'unknown' && (
              <View
                style={[
                  styles.emailResultBox,
                  phoneCheckResult.status === 'reported'
                    ? styles.emailResultDanger
                    : styles.emailResultSafe,
                ]}
              >
                <Text style={styles.emailStatus}>
                  {phoneCheckResult.status === 'reported' ? '⚠️ Reportado' : '✓ No reportado'}
                </Text>
                <Text style={styles.emailResultDetail}>
                  {phoneCheckResult.message}
                  {phoneCheckResult.count ? ` · ${phoneCheckResult.count} reportes` : ''}
                </Text>
              </View>
            )}
          </Card>

          {/* Safe Banking Links */}
          <Text style={styles.sectionTitle}>🏦 Bancos Oficiales RD</Text>
          <Text style={styles.sectionSubtitle}>
            Accede directamente a los sitios oficiales verificados
          </Text>

          <View style={styles.banksList}>
            {safeBanks.map((bank) => (
              <TouchableOpacity
                key={bank.name}
                style={styles.bankItem}
                onPress={() => handleSafeBankPress(bank.url)}
              >
                <View style={styles.bankIcon}>
                  <Text style={styles.bankIconText}>🏛️</Text>
                </View>
                <View style={styles.bankInfo}>
                  <Text style={styles.bankName}>{bank.name}</Text>
                  <Text style={styles.bankUrl}>{bank.url}</Text>
                </View>
                <Text style={styles.verifiedBadge}>✓</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Privacy Note */}
          <Text style={styles.privacyNote}>
            🔒 Todas las URLs se verifican localmente antes de cargar
          </Text>

          {/* Contactos oficiales RD */}
          <Text style={[styles.sectionTitle, { marginTop: SPACING.lg }]}>
            📞 Contactos oficiales (RD)
          </Text>
          <Text style={styles.sectionSubtitle}>
            Llama sólo a estos números si tienes dudas con un correo o enlace.
          </Text>
          <View style={styles.contactsList}>
            {BANK_CONTACTS_RD.map((c) => (
              <View key={c.name} style={styles.contactItem}>
                <View style={styles.contactInfo}>
                  <Text style={styles.contactName}>{c.name}</Text>
                  <Text
                    style={styles.contactPhone}
                    onPress={() => Linking.openURL(`tel:${c.phone.replace(/[^0-9+]/g, '')}`)}
                  >
                    {c.phone}
                  </Text>
                  <Text
                    style={styles.contactSite}
                    onPress={() => Linking.openURL(c.site)}
                  >
                    {c.site}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: SPACING.md,
  },
  headerBadge: {
    fontSize: 26,
    color: COLORS.textOnDark,
  },
  inputCard: {
    marginBottom: SPACING.lg,
  },
  inputLabel: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.offWhite,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    marginBottom: SPACING.md,
  },
  urlInput: {
    flex: 1,
    padding: SPACING.md,
    fontSize: FONTS.sizes.md,
    color: COLORS.primary,
  },
  clearButton: {
    padding: SPACING.md,
  },
  clearButtonText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.gray,
  },
  checkButton: {
    alignSelf: 'stretch',
  },
  sectionTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  sectionSubtitle: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray,
    marginBottom: SPACING.md,
  },
  banksList: {
    flex: 1,
  },
  bankItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    ...SHADOWS.small,
  },
  bankIcon: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  bankIconText: {
    fontSize: 20,
  },
  bankInfo: {
    flex: 1,
  },
  bankName: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.primary,
  },
  bankUrl: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.gray,
  },
  verifiedBadge: {
    fontSize: FONTS.sizes.lg,
    color: COLORS.safe,
  },
  privacyNote: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray,
    textAlign: 'center',
    marginTop: SPACING.md,
  },
  emailResultBox: {
    marginTop: SPACING.sm,
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
  },
  emailResultSafe: {
    backgroundColor: COLORS.safeLight,
    borderColor: COLORS.safe,
    borderWidth: 1,
  },
  emailResultDanger: {
    backgroundColor: COLORS.warningLight,
    borderColor: COLORS.danger,
    borderWidth: 1,
  },
  emailResultTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  emailResultDetail: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray,
  },
  emailStatus: {
    fontSize: FONTS.sizes.md,
    fontWeight: '700',
    marginBottom: SPACING.xs,
  },
  emailEduBox: {
    marginTop: SPACING.md,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surfaceAlt,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  emailEduTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  emailEduText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.darkGray,
    marginBottom: SPACING.xs,
    lineHeight: 18,
  },
  contactsList: {
    marginTop: SPACING.sm,
  },
  contactItem: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    ...SHADOWS.small,
  },
  contactInfo: {
    flexDirection: 'column',
  },
  contactName: {
    fontSize: FONTS.sizes.md,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  contactPhone: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.darkGray,
    marginBottom: SPACING.xs,
  },
  contactSite: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.accentDark,
  },
  quickResultBox: {
    marginTop: SPACING.sm,
  },
  callBanner: {
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.md,
  },
  callBannerDanger: {
    backgroundColor: '#fde8e8',
    borderWidth: 1,
    borderColor: '#f5b1b1',
  },
  callBannerSafe: {
    backgroundColor: '#e6f5ec',
    borderWidth: 1,
    borderColor: '#b0e2c5',
  },
  callBannerTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  callBannerNumber: {
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  callBannerDetail: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray,
  },

  // Browser styles
  browserHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  browserButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  browserButtonText: {
    fontSize: FONTS.sizes.xl,
    color: COLORS.primary,
  },
  urlBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.offWhite,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginHorizontal: SPACING.sm,
  },
  lockIcon: {
    fontSize: FONTS.sizes.sm,
    marginRight: SPACING.xs,
  },
  urlText: {
    flex: 1,
    fontSize: FONTS.sizes.sm,
    color: COLORS.darkGray,
  },
  securityBar: {
    backgroundColor: COLORS.safeLight,
    paddingVertical: SPACING.xs,
    alignItems: 'center',
  },
  securityText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.safe,
    fontWeight: '600',
  },
  webView: {
    flex: 1,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.overlay,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

