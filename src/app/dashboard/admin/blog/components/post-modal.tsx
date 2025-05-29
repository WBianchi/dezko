'use client'

import { useState, useEffect } from 'react'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from '@/components/ui/dialog'

import PostFormSimple from './post-form-simple'
import { Post } from '../columns'

interface PostModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingPost?: Post;
  categorias: { id: string; nome: string }[];
  tags: { id: string; nome: string }[];
}

export const PostModal: React.FC<PostModalProps> = ({
  isOpen,
  onClose,
  editingPost,
  categorias,
  tags
}) => {
  const [isMounted, setIsMounted] = useState(false)
  
  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return null
  }

  const title = editingPost ? 'Editar Post' : 'Criar Post'
  const description = editingPost 
    ? 'Edite as informações do post existente.' 
    : 'Adicione um novo post ao blog.'

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="pt-4">
          <PostFormSimple 
            initialData={editingPost}
            categorias={categorias}
            tags={tags}
            onClose={onClose}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default PostModal
