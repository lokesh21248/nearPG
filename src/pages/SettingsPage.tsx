import { Helmet } from 'react-helmet-async'
import { PageWrapper } from '../components/layout/PageWrapper'
import { Settings, Bell, Shield, Smartphone } from 'lucide-react'

export default function SettingsPage() {
  return (
    <PageWrapper>
      <Helmet>
        <title>Settings | NearPG</title>
      </Helmet>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2">Settings</h1>
        <p className="text-slate-500 font-medium mb-8">Manage your account preferences.</p>

        <div className="space-y-4">
          {[
            { icon: Bell, title: 'Notifications', description: 'Manage push and email notifications', available: false },
            { icon: Shield, title: 'Privacy & Security', description: 'Control your data and privacy settings', available: false },
            { icon: Smartphone, title: 'App Preferences', description: 'Theme, language, and display settings', available: false },
          ].map(({ icon: Icon, title, description, available }) => (
            <div key={title} className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center gap-4 opacity-60">
              <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <Icon size={20} />
              </div>
              <div className="flex-1">
                <p className="font-bold text-slate-800">{title}</p>
                <p className="text-sm text-slate-500">{description}</p>
              </div>
              {!available && (
                <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
                  Coming soon
                </span>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 p-5 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-start gap-3">
          <Settings size={18} className="text-indigo-500 mt-0.5 shrink-0" />
          <p className="text-sm text-indigo-700 font-medium leading-relaxed">
            More settings will be available in future updates. Stay tuned!
          </p>
        </div>
      </div>
    </PageWrapper>
  )
}
