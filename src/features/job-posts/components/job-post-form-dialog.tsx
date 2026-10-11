/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from 'react'
import { AxiosError } from 'axios'
import { Loader2, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { api } from '@/lib/api'
import { type JobPost, type JobPostDetail } from '../types'

interface Category {
  id: number
  name: string
}

interface PostImage {
  id: number
  image_url: string
}

interface JobPostFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  workerProfileId: number
  workerName: string
  categories: Category[]
  post: JobPost | null
  onSaved: () => void
}

const RATE_TYPES = [
  { value: 'hourly', label: 'Per Hour' },
  { value: 'daily', label: 'Per Day' },
  { value: 'weekly', label: 'Per Week' },
  { value: 'monthly', label: 'Per Month' },
  { value: 'per_session', label: 'Per Session' },
  { value: 'per_project', label: 'Per Project' },
]

const MAX_IMAGES = 10
const MAX_IMAGE_SIZE = 10 * 1024 * 1024

function errorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const errors = error.response?.data?.errors as Record<string, string[]> | undefined
    const firstValidationError = errors ? Object.values(errors).flat()[0] : undefined
    return firstValidationError ?? error.response?.data?.message ?? error.message
  }
  return error instanceof Error ? error.message : 'Unable to save this job post.'
}

export function JobPostFormDialog({
  open,
  onOpenChange,
  workerProfileId,
  workerName,
  categories,
  post,
  onSaved,
}: JobPostFormDialogProps) {
  const [isLoadingPost, setIsLoadingPost] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [rateAmount, setRateAmount] = useState('')
  const [rateType, setRateType] = useState('hourly')
  const [isAvailable, setIsAvailable] = useState(true)
  const [isActive, setIsActive] = useState(true)
  const [images, setImages] = useState<PostImage[]>([])
  const [removedImageIds, setRemovedImageIds] = useState<number[]>([])
  const [newImages, setNewImages] = useState<File[]>([])

  useEffect(() => {
    if (!open) return
    setLoadError(null)
    setRemovedImageIds([])
    setNewImages([])
    if (!post) {
      setTitle('')
      setDescription('')
      setCategoryId('')
      setRateAmount('')
      setRateType('hourly')
      setIsAvailable(true)
      setIsActive(true)
      setImages([])
      return
    }

    let cancelled = false
    setIsLoadingPost(true)
    api.get<{ data: { job_post: JobPostDetail } }>(`/admin/posts/${post.id}`)
      .then(({ data: response }) => {
        if (cancelled) return
        const detail = response.data.job_post
        setTitle(detail.title)
        setDescription(detail.description)
        setCategoryId(String(detail.category.id))
        setRateAmount(String(detail.rate_amount))
        setRateType(detail.rate_type)
        setIsAvailable(detail.is_available)
        setIsActive(detail.is_active)
        setImages(detail.images.map(({ id, image_url }) => ({ id, image_url })))
      })
      .catch((error: unknown) => {
        if (!cancelled) setLoadError(errorMessage(error))
      })
      .finally(() => {
        if (!cancelled) setIsLoadingPost(false)
      })

    return () => {
      cancelled = true
    }
  }, [open, post])

  const remainingImageCount = images.length + newImages.length

  function handleImageSelection(files: FileList | null) {
    if (!files) return
    const selected = Array.from(files)
    const allowed = selected.filter((file) => {
      const validType = ['image/jpeg', 'image/png', 'image/webp'].includes(file.type)
      if (!validType) toast.error(`${file.name} is not a supported image type.`)
      if (file.size > MAX_IMAGE_SIZE) toast.error(`${file.name} exceeds the 10 MB limit.`)
      return validType && file.size <= MAX_IMAGE_SIZE
    })
    const slots = MAX_IMAGES - remainingImageCount
    if (allowed.length > slots) {
      toast.error(`A job post can have at most ${MAX_IMAGES} photos.`)
    }
    setNewImages((current) => [...current, ...allowed.slice(0, Math.max(slots, 0))])
  }

  async function uploadImages(postId: number, files: File[]) {
    if (files.length === 0) return
    const formData = new FormData()
    files.forEach((file) => formData.append('images[]', file))
    await api.post(`/admin/posts/${postId}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  }

  async function handleSubmit() {
    const numericRate = Number(rateAmount)
    if (!categoryId || !title.trim() || !description.trim() || rateAmount.trim() === '' || !Number.isFinite(numericRate) || numericRate < 0) {
      toast.error('Complete all required fields with a valid starting rate.')
      return
    }

    setIsSubmitting(true)
    let savedPostId: number
    try {
      const payload = {
        ...(post ? {} : { worker_profile_id: workerProfileId }),
        service_category_id: Number(categoryId),
        title: title.trim(),
        description: description.trim(),
        rate_amount: numericRate,
        rate_type: rateType,
        is_available: isAvailable,
        is_active: isActive,
      }
      if (post) {
        await api.put(`/admin/posts/${post.id}`, payload)
        savedPostId = post.id
      } else {
        const response = await api.post<{ data: { job_post: { id: number } } }>('/admin/posts', payload)
        savedPostId = response.data.data.job_post.id
      }

      try {
        if (post && removedImageIds.length > 0) {
          await Promise.all(removedImageIds.map((imageId) =>
            api.delete(`/admin/posts/${post.id}/images/${imageId}`)
          ))
        }
        await uploadImages(savedPostId, newImages)
      } catch (imageError) {
        toast.error(`Post saved, but photo changes failed: ${errorMessage(imageError)}`)
        onSaved()
        return
      }

      toast.success(post ? 'Job post updated.' : 'Job post added.')
      onSaved()
    } catch (error) {
      toast.error(errorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!isSubmitting) onOpenChange(nextOpen)
      }}
    >
      <DialogContent className='max-h-[90vh] overflow-y-auto rounded-2xl border-border bg-card sm:max-w-2xl'>
        <DialogHeader>
          <DialogTitle>{post ? 'Edit Job Post' : `Add Job Post for ${workerName}`}</DialogTitle>
        </DialogHeader>

        {isLoadingPost ? (
          <div className='flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground'>
            <Loader2 className='h-4 w-4 animate-spin' /> Loading job post…
          </div>
        ) : loadError ? (
          <div className='py-8 text-center text-sm text-destructive'>
            Could not load this job post: {loadError}
          </div>
        ) : (
          <div className='grid gap-4 py-2 sm:grid-cols-2'>
            <div className='space-y-1.5 sm:col-span-2'>
              <Label htmlFor='job-post-category'>Service category *</Label>
              <Select value={categoryId} onValueChange={setCategoryId} disabled={isSubmitting}>
                <SelectTrigger id='job-post-category'>
                  <SelectValue placeholder='Select a category' />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={String(category.id)}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-1.5 sm:col-span-2'>
              <Label htmlFor='job-post-title'>Post title *</Label>
              <Input
                id='job-post-title'
                maxLength={100}
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                disabled={isSubmitting}
              />
              <p className='text-xs text-muted-foreground'>{title.length}/100 characters</p>
            </div>

            <div className='space-y-1.5 sm:col-span-2'>
              <Label htmlFor='job-post-description'>Description *</Label>
              <Textarea
                id='job-post-description'
                rows={4}
                maxLength={500}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                disabled={isSubmitting}
              />
              <p className='text-xs text-muted-foreground'>{description.length}/500 characters</p>
            </div>

            <div className='space-y-1.5'>
              <Label htmlFor='job-post-rate'>Starting rate (₱) *</Label>
              <Input
                id='job-post-rate'
                type='number'
                min='0'
                step='0.01'
                value={rateAmount}
                onChange={(event) => setRateAmount(event.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div className='space-y-1.5'>
              <Label htmlFor='job-post-rate-type'>Rate type *</Label>
              <Select value={rateType} onValueChange={setRateType} disabled={isSubmitting}>
                <SelectTrigger id='job-post-rate-type'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RATE_TYPES.map((rate) => (
                    <SelectItem key={rate.value} value={rate.value}>{rate.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='flex items-center justify-between rounded-lg border border-border px-4 py-3 sm:col-span-2'>
              <div>
                <p className='text-sm font-medium'>Available for booking</p>
                <p className='text-xs text-muted-foreground'>Clients can send requests for this post.</p>
              </div>
              <Switch checked={isAvailable} onCheckedChange={setIsAvailable} disabled={isSubmitting} aria-label='Available for booking' />
            </div>

            <div className='flex items-center justify-between rounded-lg border border-border px-4 py-3 sm:col-span-2'>
              <div>
                <p className='text-sm font-medium'>Active listing</p>
                <p className='text-xs text-muted-foreground'>Inactive posts are hidden from clients.</p>
              </div>
              <Switch checked={isActive} onCheckedChange={setIsActive} disabled={isSubmitting} aria-label='Active listing' />
            </div>

            <div className='space-y-2 sm:col-span-2'>
              <div>
                <Label htmlFor='job-post-photos'>Service photos (optional)</Label>
                <p className='mt-1 text-xs text-muted-foreground'>Up to 10 JPG, PNG, or WebP photos; 10 MB max each.</p>
              </div>
              <Input
                id='job-post-photos'
                type='file'
                accept='image/jpeg,image/png,image/webp'
                multiple
                disabled={isSubmitting || remainingImageCount >= MAX_IMAGES}
                onChange={(event) => {
                  handleImageSelection(event.target.files)
                  event.target.value = ''
                }}
              />
              <div className='grid grid-cols-2 gap-2 sm:grid-cols-4'>
                {images.map((image) => (
                  <div key={image.id} className='relative'>
                    <img src={image.image_url} alt='Job post service' className='aspect-square w-full rounded-md object-cover' />
                    <Button
                      type='button'
                      variant='destructive'
                      size='icon'
                      className='absolute right-1 top-1 h-7 w-7'
                      disabled={isSubmitting}
                      aria-label='Remove photo'
                      onClick={() => {
                        setImages((current) => current.filter((currentImage) => currentImage.id !== image.id))
                        setRemovedImageIds((current) => [...current, image.id])
                      }}
                    >
                      <X className='h-3.5 w-3.5' />
                    </Button>
                  </div>
                ))}
                {newImages.map((file, index) => (
                  <div key={`${file.name}-${file.lastModified}`} className='flex min-h-20 items-center justify-between gap-2 rounded-md border border-border p-2 text-xs'>
                    <span className='truncate'>{file.name}</span>
                    <Button
                      type='button'
                      variant='ghost'
                      size='icon'
                      className='h-7 w-7 shrink-0'
                      aria-label={`Remove ${file.name}`}
                      onClick={() => setNewImages((current) => current.filter((_, currentIndex) => currentIndex !== index))}
                    >
                      <X className='h-3.5 w-3.5' />
                    </Button>
                  </div>
                ))}
              </div>
              <p className='text-xs text-muted-foreground'>{remainingImageCount}/{MAX_IMAGES} photos</p>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || isLoadingPost || !!loadError}>
            {isSubmitting && <Loader2 className='h-4 w-4 animate-spin' />}
            {isSubmitting ? 'Saving…' : post ? 'Save Changes' : 'Add Post'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
