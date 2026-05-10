import React, { useState, useEffect } from'react';
import { useLanguage } from'@/components/shared/LanguageContext';
import { api } from'@/api/supabaseAPI';
import { useQuery, useMutation, useQueryClient } from'@tanstack/react-query';
import { Button } from'@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from'@/components/ui/card';
import { Input } from'@/components/ui/input';
import { Label } from'@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from'@/components/ui/select';
import { Switch } from'@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from'@/components/ui/tabs';
import { 
 Check, 
 X, 
 Loader2, 
 Settings, 
 RefreshCw,
 Zap,
 Database,
 ArrowRight,
 AlertCircle,
 Sparkles
} from'lucide-react';
import { toast } from'sonner';
import CustomizationRequestDialog from'@/components/shared/CustomizationRequestDialog';

export default function CRMSettings() {
 const { t, isRTL } = useLanguage();
 const queryClient = useQueryClient();
 const [selectedCRM, setSelectedCRM] = useState(null);
 const [fieldMapping, setFieldMapping] = useState({});
 const [syncSettings, setSyncSettings] = useState({
 auto_sync: true,
 sync_frequency:'immediate',
 two_way_sync: false
 });
 const [apiCredentials, setApiCredentials] = useState({
 webhook_url:'',
 api_url:'',
 api_key:'',
 auth_type:'api_key',
 username:'',
 password:''
 });
 const [showRequestDialog, setShowRequestDialog] = useState(false);

 const { data: user, isLoading: userLoading } = useQuery({
 queryKey: ['current-user'],
 queryFn: () => api.auth.me()
 });

 const { data: crmConfig, isLoading: configLoading } = useQuery({
 queryKey: ['crm-config'],
 queryFn: async () => {
 const profile = await api.entities.User.get(user.id);
 return profile?.crm_config || null;
 },
 enabled: !!user?.id
 });

 const updateCRMConfigMutation = useMutation({
 mutationFn: async (config) => {
 await api.entities.User.update(user.id, { crm_config: config });
 },
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ['current-user'] });
 queryClient.invalidateQueries({ queryKey: ['crm-config'] });
 toast.success(isRTL ?'تم حفظ إعدادات CRM' :'CRM settings saved');
 }
 });

 const testConnectionMutation = useMutation({
 mutationFn: async (crmType) => {
 const response = await api.functions.invoke('testCRMConnection', { crm_type: crmType });
 return response.data;
 }
 });

 const syncContactsMutation = useMutation({
 mutationFn: async () => {
 const response = await api.functions.invoke('syncContactsToCRM', {});
 return response.data;
 },
 onSuccess: () => {
 toast.success(isRTL ?'تم مزامنة جهات الاتصال' :'Contacts synced successfully');
 }
 });

 const crmIntegrationsEnabled = String(import.meta.env.VITE_CRM_INTEGRATIONS_ENABLED || '').toLowerCase() === 'true';
 const gatedProviderIds = ['salesforce', 'hubspot', 'zoho', 'bitrix24'];
 const gatedProviderSet = new Set(gatedProviderIds);
 const isAdmin = user?.role === 'admin';
 const [adminProviderFlags, setAdminProviderFlags] = useState({});

 const { data: crmProviderFlags, isLoading: crmProviderFlagsLoading } = useQuery({
 queryKey: ['crm-provider-flags'],
 queryFn: async () => {
 const value = await api.appSettings.get('crm_provider_flags');
 return value && typeof value === 'object' ? value : {};
 },
 enabled: isAdmin
 });

 const updateProviderFlagsMutation = useMutation({
 mutationFn: async (flags) => {
 return api.appSettings.set('crm_provider_flags', flags);
 },
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ['crm-provider-flags'] });
 toast.success(isRTL ? 'تم حفظ إعدادات المنصات' : 'CRM platform settings saved');
 },
 onError: () => {
 toast.error(isRTL ? 'تعذر حفظ إعدادات المنصات' : 'Failed to save CRM platform settings');
 }
 });

 useEffect(() => {
 if (crmProviderFlags && typeof crmProviderFlags === 'object') {
 setAdminProviderFlags(crmProviderFlags);
 }
 }, [crmProviderFlags]);

 const providerEnabledMap = gatedProviderIds.reduce((acc, providerId) => {
 const adminValue = adminProviderFlags?.[providerId];
 acc[providerId] = typeof adminValue === 'boolean' ? adminValue : crmIntegrationsEnabled;
 return acc;
 }, {});

 const crmProviders = [
 {
 id:'salesforce',
 name:'Salesforce',
 icon:'☁️',
 description:'World\'s #1 CRM platform',
 comingSoon: !providerEnabledMap.salesforce,
 oauth: true,
 fields: ['FirstName','LastName','Email','Phone','Company','Description']
 },
 {
 id:'hubspot',
 name:'HubSpot',
 icon:'🟠',
 description:'Inbound marketing and sales',
 comingSoon: !providerEnabledMap.hubspot,
 oauth: true,
 fields: ['firstname','lastname','email','phone','company','notes']
 },
 {
 id:'zoho',
 name:'Zoho CRM',
 icon:'🔷',
 description:'All-in-one CRM solution',
 comingSoon: !providerEnabledMap.zoho,
 oauth: false,
 fields: ['First_Name','Last_Name','Email','Phone','Company','Description']
 },
 {
 id:'bitrix24',
 name:'Bitrix24',
 icon:'🔵',
 description:'Complete business toolkit',
 comingSoon: !providerEnabledMap.bitrix24,
 oauth: false,
 needsWebhook: true,
 fields: ['NAME','LAST_NAME','EMAIL','PHONE','COMPANY_TITLE','COMMENTS']
 },
 {
 id:'custom',
 name:'Custom API',
 icon:'🔌',
 description:'Connect any REST API',
 oauth: false,
 custom: true,
 fields: ['name','email','phone','company','notes']
 }
 ];

 const defaultFieldMapping = {
 visitor_name:'name',
 visitor_email:'email',
 visitor_phone:'phone',
 visitor_company:'company',
 notes:'notes'
 };

 useEffect(() => {
 if (crmConfig) {
 setSelectedCRM(crmConfig.provider);
 setFieldMapping(crmConfig.field_mapping || defaultFieldMapping);
 setSyncSettings(crmConfig.sync_settings || syncSettings);
 setApiCredentials(crmConfig.api_credentials || apiCredentials);
 }
 }, [crmConfig]);

 useEffect(() => {
 const params = new URLSearchParams(window.location.search);
 const oauthStatus = params.get('oauth');
 const message = params.get('message');
 const provider = params.get('provider');

 if (!oauthStatus) return;

 if (oauthStatus === 'success') {
 queryClient.invalidateQueries({ queryKey: ['current-user'] });
 queryClient.invalidateQueries({ queryKey: ['crm-config'] });
 toast.success(message || (isRTL ? 'تم ربط CRM بنجاح' : `${provider || 'CRM'} connected successfully`));
 } else if (oauthStatus === 'error') {
 toast.error(message || (isRTL ? 'فشل ربط CRM' : 'CRM connection failed'));
 }

 params.delete('oauth');
 params.delete('message');
 params.delete('provider');
 const nextSearch = params.toString();
 const nextUrl = `${window.location.pathname}${nextSearch ? `?${nextSearch}` : ''}${window.location.hash || ''}`;
 window.history.replaceState({}, '', nextUrl);
 }, [isRTL, queryClient]);

 const activeProviderId = selectedCRM || crmConfig?.provider || null;
 const activeProvider = crmProviders.find((provider) => provider.id === activeProviderId);
 const isSavedConnection = Boolean(crmConfig?.provider);
 const isActiveProviderComingSoon = Boolean(activeProvider?.comingSoon && gatedProviderSet.has(activeProvider.id));

 const handleAdminProviderToggle = (providerId, enabled) => {
 setAdminProviderFlags((prev) => ({ ...prev, [providerId]: enabled }));
 };

 const handleSaveAdminCRMPlatforms = () => {
 if (!isAdmin) return;
 updateProviderFlagsMutation.mutate(adminProviderFlags);
 };

 const handleConnectCRM = async (provider) => {
 if (provider.comingSoon && gatedProviderSet.has(provider.id)) {
 toast.info(isRTL ? 'هذا التكامل قريباً' : `${provider.name} integration is coming soon`);
 return;
 }

 if (provider.oauth) {
 try {
 // Request OAuth through backend function
 const response = await api.functions.invoke('connectCRM', { 
 crm_type: provider.id 
 });
 
 if (response.data?.auth_url) {
 window.location.href = response.data.auth_url;
 return;
 }

 if (response.data?.message) {
 toast.info(response.data.message);
 }
 } catch (error) {
 toast.error(isRTL ?'فشل الاتصال بـ CRM' :'Failed to connect to CRM');
 }
 } else {
 setSelectedCRM(provider.id);
 }
 };

 const handleSaveConfig = () => {
 if (isActiveProviderComingSoon) {
 toast.info(isRTL ? 'هذا التكامل قريباً' : 'This integration is coming soon');
 return;
 }

 const config = {
 provider: selectedCRM,
 field_mapping: fieldMapping,
 sync_settings: syncSettings,
 api_credentials: (selectedCRM ==='bitrix24' || selectedCRM ==='custom') ? apiCredentials : undefined,
 connected_at: new Date().toISOString(),
 status:'active'
 };
 updateCRMConfigMutation.mutate(config);
 };

 const handleTestConnection = async () => {
 if (isActiveProviderComingSoon) {
 toast.info(isRTL ? 'هذا التكامل قريباً' : 'This integration is coming soon');
 return;
 }

 try {
 const result = await testConnectionMutation.mutateAsync(selectedCRM);
 if (result.success) {
 toast.success(isRTL ?'الاتصال ناجح!' :'Connection successful!');
 } else {
 toast.error(result.message ||'Connection failed');
 }
 } catch (error) {
 toast.error(isRTL ?'فشل اختبار الاتصال' :'Connection test failed');
 }
 };

 const handleDisconnect = () => {
 updateCRMConfigMutation.mutate(null);
 setSelectedCRM(null);
 setFieldMapping(defaultFieldMapping);
 };

 if (userLoading || configLoading) {
 return (
 <div className="flex items-center justify-center min-h-[400px]">
 <Loader2 className="h-8 w-8 animate-spin text-cyan-600" />
 </div>
 );
 }

 return (
 <div className="max-w-5xl mx-auto space-y-6">
 {/* Header */}
 <div className="flex items-start justify-between">
 <div>
 <h1 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-3">
 {isRTL ?'إعدادات CRM' :'CRM Settings'}
 <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-300">
 ✓ {isRTL ?'متاح' :'Available'}
 </span>
 </h1>
 <p className="text-slate-500 mt-1">
 {isRTL 
 ?'يمكنك الآن ربط CRM ومزامنة جهات الاتصال من هذه الصفحة'
 :'You can now connect your CRM and sync contacts from this page'
 }
 </p>
 </div>
 <Button variant="outline" onClick={() => setShowRequestDialog(true)}>
 <Sparkles className="h-4 w-4 mr-2" />
 {isRTL ?'طلب تخصيص' :'Request Customization'}
 </Button>
 </div>

 <CustomizationRequestDialog
 open={showRequestDialog}
 onOpenChange={setShowRequestDialog}
 page="crm_settings"
 pageName={isRTL ?'إعدادات CRM' :'CRM Settings'}
 />

 {isAdmin && (
 <Card className="border-amber-300 bg-amber-50/40">
 <CardHeader>
 <CardTitle className="flex items-center gap-2">
 <Settings className="h-5 w-5 text-amber-700" />
 {isRTL ? 'إعدادات CRM للمشرف' : 'Admin CRM Controls'}
 </CardTitle>
 <CardDescription>
 {isRTL
 ? 'يمكنك تفعيل أو إيقاف كل منصة CRM. سيتم عرض "قريباً" للمستخدمين عندما تكون المنصة غير مفعلة.'
 : 'Enable or disable each CRM platform. Disabled platforms are shown as "Soon" for users.'}
 </CardDescription>
 </CardHeader>
 <CardContent className="space-y-5">
 <div className="grid md:grid-cols-2 gap-4">
 {crmProviders.filter((provider) => gatedProviderSet.has(provider.id)).map((provider) => (
 <div key={`admin-${provider.id}`} className="flex items-center justify-between rounded-lg border bg-white p-3">
 <div className="flex items-center gap-3">
 <span className="text-2xl">{provider.icon}</span>
 <div>
 <p className="font-medium text-slate-900">{provider.name}</p>
 <p className="text-xs text-slate-500">{providerEnabledMap[provider.id] ? (isRTL ? 'مفعّل' : 'Enabled') : (isRTL ? 'قريباً' : 'Soon')}</p>
 </div>
 </div>
 <Switch
 checked={Boolean(providerEnabledMap[provider.id])}
 onCheckedChange={(checked) => handleAdminProviderToggle(provider.id, checked)}
 disabled={crmProviderFlagsLoading || updateProviderFlagsMutation.isPending}
 />
 </div>
 ))}
 </div>

 <Button onClick={handleSaveAdminCRMPlatforms} disabled={updateProviderFlagsMutation.isPending || crmProviderFlagsLoading}>
 {updateProviderFlagsMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Check className="h-4 w-4 mr-2" />}
 {isRTL ? 'حفظ إعدادات المنصات' : 'Save Platform Settings'}
 </Button>

 <div className="rounded-lg border bg-white p-4 space-y-2 text-sm text-slate-700">
 <p className="font-semibold text-slate-900">{isRTL ? 'دليل تفعيل لاحق' : 'Enablement Guide (Later)'}</p>
 <ul className="list-disc pl-5 space-y-1">
 <li>{isRTL ? 'Supabase: تشغيل migration رقم 022 ونشر دوال CRM.' : 'Supabase: run migration 022 and deploy CRM functions.'}</li>
 <li>{isRTL ? 'إعداد أسرار OAuth (Salesforce/HubSpot) و APP_BASE_URL.' : 'Set OAuth secrets (Salesforce/HubSpot) and APP_BASE_URL.'}</li>
 <li>{isRTL ? 'تعيين Redirect URI إلى crmOAuthCallback في إعدادات التطبيقات.' : 'Set provider redirect URI to crmOAuthCallback.'}</li>
 <li>{isRTL ? 'جدولة refreshCRMTokens كل 5-10 دقائق.' : 'Schedule refreshCRMTokens every 5–10 minutes.'}</li>
 </ul>
 <p className="text-xs text-slate-500">
 {isRTL
 ? 'المرجع الكامل: CRM_INTEGRATION_ENABLEMENT_GUIDE_2026-05-08.md'
 : 'Full reference: CRM_INTEGRATION_ENABLEMENT_GUIDE_2026-05-08.md'}
 </p>
 </div>
 </CardContent>
 </Card>
 )}

 {!activeProviderId ? (
 /* CRM Selection */
 <div className="grid md:grid-cols-3 gap-4">
 {crmProviders.map((provider) => (
 <Card 
 key={provider.id}
 className={`transition-all ${provider.comingSoon ? 'opacity-80 cursor-default' : 'hover:shadow-lg cursor-pointer'}`}
 >
 <CardHeader>
 <div className="flex items-start justify-between">
 <div className="text-4xl mb-2">{provider.icon}</div>
 {provider.comingSoon ? (
 <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-300">
 {isRTL ? 'قريباً' : 'Soon'}
 </span>
 ) : provider.oauth ? (
 <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-cyan-100 text-cyan-700 border border-cyan-300">
 OAuth
 </span>
 ) : null}
 </div>
 <CardTitle className="text-lg">{provider.name}</CardTitle>
 <CardDescription className="text-sm">
 {provider.description}
 </CardDescription>
 </CardHeader>
 <CardContent>
 <Button className="w-full" variant="outline" onClick={() => handleConnectCRM(provider)} disabled={provider.comingSoon}>
 <Zap className="h-4 w-4 mr-2" />
 {provider.comingSoon
 ? (isRTL ? 'قريباً...' : 'Coming Soon...')
 : provider.oauth
 ? (isRTL ? 'ربط الآن' : 'Connect Now')
 : (isRTL ? 'إعداد الآن' : 'Configure Now')}
 </Button>
 </CardContent>
 </Card>
 ))}
 </div>
 ) : (
 /* Configuration */
 <Tabs defaultValue="connection" className="space-y-6">
 <TabsList className="grid w-full grid-cols-3">
 <TabsTrigger value="connection">
 {isRTL ?'الاتصال' :'Connection'}
 </TabsTrigger>
 <TabsTrigger value="mapping">
 {isRTL ?'تعيين الحقول' :'Field Mapping'}
 </TabsTrigger>
 <TabsTrigger value="sync">
 {isRTL ?'المزامنة' :'Sync Settings'}
 </TabsTrigger>
 </TabsList>

 {/* Connection Tab */}
 <TabsContent value="connection" className="space-y-4">
 {(selectedCRM ==='bitrix24' || selectedCRM ==='custom') && !crmConfig?.api_credentials && (
 <Card>
 <CardHeader>
 <CardTitle>
 {selectedCRM ==='bitrix24' 
 ? (isRTL ?'إعدادات Bitrix24' :'Bitrix24 Settings')
 : (isRTL ?'إعدادات API المخصص' :'Custom API Settings')
 }
 </CardTitle>
 <CardDescription>
 {selectedCRM ==='bitrix24'
 ? (isRTL ?'أدخل رابط Webhook الخاص بـ Bitrix24' :'Enter your Bitrix24 webhook URL')
 : (isRTL ?'قم بتكوين نقطة نهاية API المخصصة' :'Configure your custom API endpoint')
 }
 </CardDescription>
 </CardHeader>
 <CardContent className="space-y-4">
 {selectedCRM ==='bitrix24' ? (
 <>
 <div className="space-y-2">
 <Label>{isRTL ?'رابط Webhook' :'Webhook URL'}</Label>
 <Input
 placeholder="https://your-domain.bitrix24.com/rest/1/xxxxx/"
 value={apiCredentials.webhook_url}
 onChange={(e) => setApiCredentials({ ...apiCredentials, webhook_url: e.target.value })}
 />
 <p className="text-xs text-slate-500">
 {isRTL 
 ?'احصل على رابط Webhook من Bitrix24 → الإعدادات → الخدمات الأخرى → Webhook الصادر'
 :'Get your webhook URL from Bitrix24 → Settings → Other → Outbound webhook'
 }
 </p>
 </div>
 </>
 ) : (
 <>
 <div className="space-y-2">
 <Label>{isRTL ?'نقطة نهاية API' :'API Endpoint'}</Label>
 <Input
 placeholder="https://api.yourcrm.com/contacts"
 value={apiCredentials.api_url}
 onChange={(e) => setApiCredentials({ ...apiCredentials, api_url: e.target.value })}
 />
 </div>

 <div className="space-y-2">
 <Label>{isRTL ?'نوع المصادقة' :'Authentication Type'}</Label>
 <Select
 value={apiCredentials.auth_type}
 onValueChange={(value) => setApiCredentials({ ...apiCredentials, auth_type: value })}
 >
 <SelectTrigger>
 <SelectValue />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="api_key">API Key</SelectItem>
 <SelectItem value="bearer_token">Bearer Token</SelectItem>
 <SelectItem value="basic_auth">Basic Auth</SelectItem>
 </SelectContent>
 </Select>
 </div>

 {apiCredentials.auth_type ==='basic_auth' ? (
 <>
 <div className="space-y-2">
 <Label>{isRTL ?'اسم المستخدم' :'Username'}</Label>
 <Input
 value={apiCredentials.username}
 onChange={(e) => setApiCredentials({ ...apiCredentials, username: e.target.value })}
 />
 </div>
 <div className="space-y-2">
 <Label>{isRTL ?'كلمة المرور' :'Password'}</Label>
 <Input
 type="password"
 value={apiCredentials.password}
 onChange={(e) => setApiCredentials({ ...apiCredentials, password: e.target.value })}
 />
 </div>
 </>
 ) : (
 <div className="space-y-2">
 <Label>
 {apiCredentials.auth_type ==='api_key' 
 ? (isRTL ?'مفتاح API' :'API Key')
 : (isRTL ?'رمز Bearer' :'Bearer Token')
 }
 </Label>
 <Input
 type="password"
 value={apiCredentials.api_key}
 onChange={(e) => setApiCredentials({ ...apiCredentials, api_key: e.target.value })}
 />
 </div>
 )}
 </>
 )}

 <Button onClick={handleSaveConfig} disabled={updateCRMConfigMutation.isPending} className="w-full">
 {updateCRMConfigMutation.isPending ? (
 <Loader2 className="h-4 w-4 mr-2 animate-spin" />
 ) : (
 <Check className="h-4 w-4 mr-2" />
 )}
 {isRTL ?'حفظ الإعدادات' :'Save Settings'}
 </Button>
 </CardContent>
 </Card>
 )}

 <Card>
 <CardHeader>
 <CardTitle className="flex items-center gap-2">
 <Database className="h-5 w-5" />
 {isRTL ?'الاتصال النشط' :'Active Connection'}
 </CardTitle>
 </CardHeader>
 <CardContent className="space-y-4">
 <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
 <div className="flex items-center gap-3">
 <div className="text-3xl">
 {activeProvider?.icon}
 </div>
 <div>
 <p className="font-semibold text-slate-900">
 {activeProvider?.name}
 </p>
 <p className="text-sm text-slate-500">
 {isSavedConnection
 ? `${isRTL ? 'متصل منذ' : 'Connected since'} ${new Date(crmConfig.connected_at).toLocaleDateString()}`
 : (isRTL ? 'لم يتم الحفظ بعد' : 'Not saved yet')}
 </p>
 </div>
 </div>
 {isSavedConnection ? <Check className="h-6 w-6 text-green-600" /> : <AlertCircle className="h-6 w-6 text-amber-500" />}
 </div>

 <div className="flex gap-2">
 <Button 
 variant="outline" 
 onClick={handleTestConnection}
 disabled={testConnectionMutation.isPending || isActiveProviderComingSoon}
 >
 {testConnectionMutation.isPending ? (
 <Loader2 className="h-4 w-4 mr-2 animate-spin" />
 ) : (
 <RefreshCw className="h-4 w-4 mr-2" />
 )}
 {isRTL ?'اختبار الاتصال' :'Test Connection'}
 </Button>
 <Button 
 variant="outline"
 onClick={() => syncContactsMutation.mutate()}
 disabled={syncContactsMutation.isPending || isActiveProviderComingSoon}
 >
 {syncContactsMutation.isPending ? (
 <Loader2 className="h-4 w-4 mr-2 animate-spin" />
 ) : (
 <RefreshCw className="h-4 w-4 mr-2" />
 )}
 {isRTL ?'مزامنة الآن' :'Sync Now'}
 </Button>
 <Button 
 variant="destructive" 
 onClick={handleDisconnect}
 className="ml-auto"
 >
 <X className="h-4 w-4 mr-2" />
 {isRTL ?'قطع الاتصال' :'Disconnect'}
 </Button>
 </div>
 </CardContent>
 </Card>
 </TabsContent>

 {/* Field Mapping Tab */}
 <TabsContent value="mapping" className="space-y-4">
 <Card>
 <CardHeader>
 <CardTitle className="flex items-center gap-2">
 <ArrowRight className="h-5 w-5" />
 {isRTL ?'تعيين الحقول' :'Field Mapping'}
 </CardTitle>
 <CardDescription>
 {isRTL 
 ?'حدد كيفية تعيين حقول بطاقة العمل إلى حقول CRM'
 :'Define how business card fields map to CRM fields'
 }
 </CardDescription>
 </CardHeader>
 <CardContent className="space-y-4">
 {Object.entries(fieldMapping).map(([cardField, crmField]) => (
 <div key={cardField} className="grid md:grid-cols-3 gap-4 items-center">
 <div className="font-medium text-slate-700">
 {cardField.replace('visitor_','').replace('_','')}
 </div>
 <ArrowRight className="h-4 w-4 text-slate-400 mx-auto" />
 <Select
 value={crmField}
 onValueChange={(value) => setFieldMapping({ ...fieldMapping, [cardField]: value })}
 >
 <SelectTrigger>
 <SelectValue />
 </SelectTrigger>
 <SelectContent>
 {crmProviders
 .find(p => p.id === activeProviderId)
 ?.fields.map((field) => (
 <SelectItem key={field} value={field}>
 {field}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>
 ))}

 <Button onClick={handleSaveConfig} disabled={updateCRMConfigMutation.isPending}>
 {updateCRMConfigMutation.isPending ? (
 <Loader2 className="h-4 w-4 mr-2 animate-spin" />
 ) : (
 <Check className="h-4 w-4 mr-2" />
 )}
 {isRTL ?'حفظ التعيين' :'Save Mapping'}
 </Button>
 </CardContent>
 </Card>
 </TabsContent>

 {/* Sync Settings Tab */}
 <TabsContent value="sync" className="space-y-4">
 <Card>
 <CardHeader>
 <CardTitle className="flex items-center gap-2">
 <Settings className="h-5 w-5" />
 {isRTL ?'إعدادات المزامنة' :'Sync Settings'}
 </CardTitle>
 </CardHeader>
 <CardContent className="space-y-6">
 <div className="flex items-center justify-between">
 <div>
 <Label className="text-base">{isRTL ?'المزامنة التلقائية' :'Auto Sync'}</Label>
 <p className="text-sm text-slate-500">
 {isRTL 
 ?'مزامنة جهات الاتصال الجديدة تلقائيًا'
 :'Automatically sync new contacts'
 }
 </p>
 </div>
 <Switch
 checked={syncSettings.auto_sync}
 onCheckedChange={(checked) => setSyncSettings({ ...syncSettings, auto_sync: checked })}
 />
 </div>

 <div className="space-y-2">
 <Label>{isRTL ?'تكرار المزامنة' :'Sync Frequency'}</Label>
 <Select
 value={syncSettings.sync_frequency}
 onValueChange={(value) => setSyncSettings({ ...syncSettings, sync_frequency: value })}
 >
 <SelectTrigger>
 <SelectValue />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="immediate">{isRTL ?'فوري' :'Immediate'}</SelectItem>
 <SelectItem value="hourly">{isRTL ?'كل ساعة' :'Hourly'}</SelectItem>
 <SelectItem value="daily">{isRTL ?'يومي' :'Daily'}</SelectItem>
 </SelectContent>
 </Select>
 </div>

 <div className="flex items-center justify-between">
 <div>
 <Label className="text-base">{isRTL ?'المزامنة الثنائية' :'Two-Way Sync'}</Label>
 <p className="text-sm text-slate-500">
 {isRTL 
 ?'مزامنة التحديثات من CRM إلى Rawajcard'
 :'Sync updates from CRM back to Rawajcard'
 }
 </p>
 </div>
 <Switch
 checked={syncSettings.two_way_sync}
 onCheckedChange={(checked) => setSyncSettings({ ...syncSettings, two_way_sync: checked })}
 />
 </div>

 <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
 <div className="flex gap-2">
 <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
 <div className="text-sm text-blue-900">
 {isRTL
 ?'المزامنة الثنائية ستقوم بتحديث سجلات جهات الاتصال الخاصة بك بناءً على التغييرات في CRM'
 :'Two-way sync will update your contact records based on changes in your CRM'
 }
 </div>
 </div>
 </div>

 <Button onClick={handleSaveConfig} disabled={updateCRMConfigMutation.isPending}>
 {updateCRMConfigMutation.isPending ? (
 <Loader2 className="h-4 w-4 mr-2 animate-spin" />
 ) : (
 <Check className="h-4 w-4 mr-2" />
 )}
 {isRTL ?'حفظ الإعدادات' :'Save Settings'}
 </Button>
 </CardContent>
 </Card>
 </TabsContent>
 </Tabs>
 )}
 </div>
 );
}