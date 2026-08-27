import { ContentSection } from '@/features/settings/components/content-section'
import { ProfileForm } from './profile-form'

export function AccountProfile() {
  return (
    <ContentSection
      title='Profile'
      desc='Update your name and contact details.'
    >
      <ProfileForm />
    </ContentSection>
  )
}
