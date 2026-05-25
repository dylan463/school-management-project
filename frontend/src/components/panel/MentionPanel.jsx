import {useState,useEffect,useMemo} from 'react'
import Card from '../ui/Card'
import SearchInput from '../SearchInput'
import DataTable,{CreateAction} from '../DataTable'
import {useMentions} from '../../hooks/mentions/useMentions'
import {useCreateMention} from '../../hooks/mentions/useCreateMention'
import {useUpdateMention} from '../../hooks/mentions/useUpdateMention'
import {useDeleteMention} from '../../hooks/mentions/useDeleteMention'
import useDebounced from '../../hooks/useDebounced'
import Button from '../ui/Button'
import { PAGE_SIZE } from '../../utils/constants'
import Paginator from '../Paginator'
import {useModal} from '../../context/ModalContext'
import {toast} from "react-toastify"

function AddEditForm({
  onClose,
  editingItem = null,
}) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [loading,setLoading] = useState(false)

  const create = useCreateMention();
  const update = useUpdateMention();

  useEffect(() => {
    if (editingItem) {
      setName(editingItem.text);
      setCode(editingItem.code);
    }
  }, [editingItem]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name || !code){
      toast.error("veillez remplire les champs")
      return
    }
    setLoading(true)

    const data = {
      text: name,
      code,
    };

    // UPDATE
    if (editingItem) {
      await update.mutateAsync(
      {
        id: editingItem.id,
        data,
      },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
      setLoading(false)
      return;
    }

    // CREATE
    create.mutate(data, {
      onSuccess: () => {
        onClose();
      },
    });
    setLoading(false)
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4"
    >
      <label htmlFor="Nom">Nom</label>
      <input
        value={name}
        id='Nom'
        onChange={(e) => setName(e.target.value)}
        placeholder="Ex : Télécommunication"
        className="border rounded-lg px-3 py-2"
      />

      <label htmlFor="Code">Code</label>
      <input
        id='Code'
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Ex : TCO"
        className="border rounded-lg px-3 py-2"
      />
      <div className='flex justify-center gap-x-3'>
        <Button
          onClick={()=> {onClose()}}
          variant='secondary'
        >
          Annuler
        </Button>
        <Button
          type="submit"
          variant='primary'
        >
          {loading ? '...en cours': editingItem ? "Modifier" : "Créer"}
        </Button>
      </div>
    </form>
  );
}

function DeleteConfirmForm({onClose,DeletingItem}){
  const deleting = useDeleteMention()

  const handleSubmit = (e) =>{
    deleting.mutate(DeletingItem.id)
    onClose()
  }
  return (
    <div className='grid grid-cols-1 gap-y-3'>
      <p>Voulez vous vraiment supprimer la mention {DeletingItem.text} ?</p>
      <div className="flex flex-row gap-x-3 justify-end">
        <Button
          onClick={()=> {onClose()}}
          variant='secondary'
        >
          Annuler
        </Button>
        <Button
          onClick={()=>{handleSubmit()}}
          variant='primary'
        >
          Ok
        </Button>
      </div>
    </div>
  )
}

function Row(content) {
  const className = 'pl-5'
  return (
    <>
      <td className={`${className}`}>{content.id}</td>
      <td className={`${className}`}>{content.text}</td>
      <td className={`${className}`}>{content.code}</td>
    </>
  )
}

function MentionPanel() {
  const [search,setSearch] = useState('')
  const debouncedSearch = useDebounced(search,1000)
  const [page,setPage] = useState(1)
  const filters = useMemo(() => ({
    ...(debouncedSearch ? { search: debouncedSearch } : {})
  }), [debouncedSearch])
  const {data,isLoading} = useMentions(filters)

  const totalPages = data ? Math.ceil(data.count/PAGE_SIZE) : 0

  const { openModal, closeModal } = useModal()

  const handleAdd = () => {
    openModal({title:'créer une mention',content:<AddEditForm onClose={closeModal}/>})
  }
  const handleEdit = (item) => {
    openModal({title:'Modifier une mention',content:<AddEditForm onClose={closeModal} editingItem={item}/>})
  }
  const handleDelete = (item) => {
    openModal({title:'suppremer une mention', content:<DeleteConfirmForm onClose={closeModal} DeletingItem={item}/>})
  }

  const actions = [
    CreateAction('Modifier','blue',handleEdit,(content)=>{return true},true),
    CreateAction('Supprimer','red',handleDelete,(content)=>{return true},true),
  ]


  return (
    <Card>
      <div className='m-4 flex flex-col flex-1 gap-y-2'>
          <h2>gestion des mentions</h2>
          <div className='flex justify-between'>
            <SearchInput
            placeholder='Rechercher une mention'
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            />
            <Button
            variant='primary'
            onClick={() => {handleAdd()}}
            >
              Ajouter un mention
            </Button>
          </div>
      </div>
      <>
        {isLoading ? <div className='grid grid-cols-1 min-h-[200px] items-center justify-items-center w-full text-xs text-slate-500'>...Chargement</div> :
        <DataTable
        noContentText='Aucune mention trouvée'
        contents={data.results}
        tableheadNames={['id','nom','code']}
        Row={Row}
        actions={actions}
        headActions=' '
        headClassName='pl-5'
        />}
      </>
      <div className='mb-5'>
        <Paginator
        page={page}
        setPage={setPage}
        totalPages={totalPages}
        />
      </div>
    </Card>
  )
}

export default MentionPanel