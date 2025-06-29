// hooks/use-authorized-projects.ts
import { useEffect, useState } from "react"

export function useAuthorizedProjects(projects: any[]) {
  const [authorizedIds, setAuthorizedIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkAccess() {
      try {
        console.log('🔍 useAuthorizedProjects: Checking access for projects:', projects.length, projects.map(p => p.name))
        
        const results = await Promise.all(
          projects.map(async (project) => {
            try {
              const res = await fetch(`/api/project-access?projectId=${project.id}`)
              
              if (!res.ok) {
                console.error(`❌ Error checking access for project ${project.id}:`, res.status)
                // Se l'API non esiste (404), autorizza tutti i progetti per ora
                if (res.status === 404) {
                  console.log(`🟡 API /api/project-access non trovata, autorizzando progetto ${project.id}`)
                  return project.id
                }
                return null
              }
              
              const data = await res.json()
              console.log(`✅ Project ${project.name} (${project.id}) access:`, data?.authorized)
              return data?.authorized ? project.id : null
            } catch (error) {
              console.error(`❌ Error fetching access for project ${project.id}:`, error)
              // In caso di errore di rete, autorizza per ora
              console.log(`🟡 Errore di rete, autorizzando progetto ${project.id} temporaneamente`)
              return project.id
            }
          })
        )
        
        const authorized = results.filter(Boolean) as string[]
        console.log('🎯 useAuthorizedProjects: Final authorized projects:', authorized)
        setAuthorizedIds(authorized)
      } catch (error) {
        console.error('❌ Error in checkAccess:', error)
      } finally {
        setLoading(false)
        console.log('✅ useAuthorizedProjects: Loading finished')
      }
    }

    // Se non ci sono progetti o projects è undefined/null, non caricare
    if (!projects || projects.length === 0) {
      console.log('📭 useAuthorizedProjects: No projects to check, setting loading to false')
      setLoading(false)
      setAuthorizedIds([])
      return
    }

    // Reset loading quando cambiano i progetti
    console.log('🔄 useAuthorizedProjects: Starting access check...')
    setLoading(true)
    checkAccess()
  }, [projects])

  console.log('📊 useAuthorizedProjects: Current state - authorizedIds:', authorizedIds, 'loading:', loading)

  return { authorizedIds, loading }
}