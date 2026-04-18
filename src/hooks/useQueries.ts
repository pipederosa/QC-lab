// src/hooks/useQueries.ts
// React Query hooks. Cuando se conecte la API real, solo cambian las
// queryFn — el resto del componente no se toca.

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchStudies, fetchScrumRecords, fetchAuditLog, fetchUsers,
} from '@/lib/data'

// ============================================================
// QUERY KEYS — centralizados para invalidar con precisión
// ============================================================
export const QK = {
  studies:      ['studies']      as const,
  scrumRecords: ['scrumRecords'] as const,
  auditLog:     ['auditLog']     as const,
  users:        ['users']        as const,
} as const

// ============================================================
// QUERIES
// ============================================================

export function useStudies() {
  return useQuery({
    queryKey: QK.studies,
    queryFn: fetchStudies,
    staleTime: 1000 * 60 * 5, // 5 min
  })
}

export function useScrumRecords() {
  return useQuery({
    queryKey: QK.scrumRecords,
    queryFn: fetchScrumRecords,
    staleTime: 1000 * 60 * 5,
  })
}

export function useAuditLog() {
  return useQuery({
    queryKey: QK.auditLog,
    queryFn: fetchAuditLog,
    staleTime: 1000 * 60 * 2,
  })
}

export function useUsers() {
  return useQuery({
    queryKey: QK.users,
    queryFn: fetchUsers,
    staleTime: 1000 * 60 * 10,
  })
}

// ============================================================
// NOTE: En esta demo los datos viven en el Zustand store,
// no en React Query. Para producción con API real:
//
// 1. Mover toda la mutación al store a mutations de React Query:
//
//    export function useUpdateStudy() {
//      const qc = useQueryClient()
//      return useMutation({
//        mutationFn: ({ id, field, value }) =>
//          fetch(`/api/studies/${id}`, { method:'PATCH', body: JSON.stringify({[field]:value}) }),
//        onSuccess: () => qc.invalidateQueries({ queryKey: QK.studies }),
//      })
//    }
//
// 2. El componente solo hace: const mutation = useUpdateStudy()
//    mutation.mutate({ id, field, value })
//
// 3. React Query maneja loading, error, retry y cache automáticamente.
// ============================================================
