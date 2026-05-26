import { createFileRoute } from '@tanstack/react-router'
import { DeliveryFormPage } from './deliveries.new'

export const Route = createFileRoute('/_layout/deliveries/new')({
  component: DeliveryFormPage,
  // No additional validation needed; the original file handles search params.
})
