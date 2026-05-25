import {useState,useEffect,useMemo} from 'react'
import Card from '../ui/Card'
import SearchInput from '../SearchInput'
import SearchWithDropDown from '../SearchWithDropDown'
import DataTable,{CreateAction} from '../DataTable'
import {useHeads} from '../../hooks/heads/useHeads'
import {useMentions} from '../../hooks/mentions/useMentions'
import {useCreateHead} from '../../hooks/heads/useCreateHead'
import {useUpdateHead} from '../../hooks/heads/useUpdateHead'
import {useDeleteHead} from '../../hooks/heads/useDeleteHead'
import useDebounced from '../../hooks/useDebounced'
import Button from '../ui/Button'
import { PAGE_SIZE } from '../../utils/constants'
import Paginator from '../Paginator'
import {useModal} from '../../context/ModalContext'
import {toast} from "react-toastify"
import Badge from '../../components/Badge'

function AddEditForm({
  onClose,
  editingItem = null,
}) {
  const [firstName,setFirstName] = useState('')
  const [lastName,setLastName] = useState('')
  const [email,setEmail] = useState('')
  const [mention,setMention] = useState(null)
  const [loading,setLoading] = useState(false)

  const [search,setSearch] = useState('')
  const debouncedSearch = useDebounced(search,1000)

  const filters = useMemo(() => ({
    ...(debouncedSearch ? { search: debouncedSearch } : {})
  }), [debouncedSearch])

  const {data,isFetching,isRefetching} = useMentions(filters)
  const results = isFetching || isRefetching ? [] : !debouncedSearch ? [] : data.results.slice(0,2)

  const create = useCreateHead();
  const update = useUpdateHead();

  useEffect(() => {
    if (editingItem) {
      setFirstName(editingItem.first_name)
      setLastName(editingItem.last_name)
      setEmail(editingItem.email)
      setMention(editingItem.mention)
    }
  }, [editingItem]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!firstName || !lastName || !email || !mention){
      toast.error("veillez remplire les champs")
      return
    }
    setLoading(true)

    const data = {
      last_name:lastName,
      first_name:firstName,
      email:email,
      mention:mention.id
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
        onError: (error) => {
          toast.error(error.response.data.error)
        },
        onSettled: () =>{
          setLoading(false)
        }
      }
    );
      return;
    }

    // CREATE
    await create.mutateAsync(data, {
      onSuccess: () => {
        onClose();
      },
      onError: (error) => {
        toast.error(error.response.data.error) 
      },
      onSettled: () =>{
        setLoading(false)
      }
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4"
      >
      <SearchWithDropDown
        contents={results}
        search={search}
        setSearch={setSearch}
        searchLoading={isFetching || isRefetching}
        debouncedSearch={debouncedSearch}
        setSelectContent={(mention)=> {setMention(mention)}}
        contentDisplay={(mention) => {return (
          <div className='w-[40px]'>
            <Badge content={mention.text} color='slate'/>
            <Badge content={mention.code} color='yellow'/>
          </div>
        )}
        }
      />
      <div className='border border-slate-200 min-h-[40px] rounded-lg flex items-center'>
        <div className='w-full flex justify-center'>{mention && `${mention.text}\\${mention.code}`}</div>
        <button
          type='button'
          onClick={() => setMention(null)}
          className="w-8 h-8 mr-2 flex items-center justify-center rounded-lg bg-gray-100 text-gray-500 hover:text-black hover:bg-gray-200"
        >
          ✕
        </button>
      </div>
      <label htmlFor="Nom">Nom</label>
      <input
        value={firstName}
        id='Nom'
        onChange={(e) => setFirstName(e.target.value)}
        placeholder="Ex : HINTSANA"
        className="border rounded-lg px-3 py-2"
      />

      <label htmlFor="lastName">Prénoms</label>
      <input
        id='lastName'
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
        placeholder="Ex : Dylan"
        className="border rounded-lg px-3 py-2"
      />

      <label htmlFor="email">email</label>
      <input
        id='email'
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Ex : columbian@gmail.com"
        className="border rounded-lg px-3 py-2"
      />

      <div className='flex justify-center gap-x-3 mt-5'>
        <button
          onClick={()=> {onClose()}}
          className="w-[100px] bg-stale text-black border border-slate rounded-lg py-2"
        >
          Annuler
        </button>
        <button
          type="submit"
          className="w-[100px] bg-black hover:bg-[#222222] text-white rounded-lg py-2"
        >
          {loading ? '...en cours': editingItem ? "Modifier" : "Créer"}
        </button>
      </div>
    </form>
  );
}

function DeleteConfirmForm({onClose,DeletingItem}){
  const deleting = useDeleteHead()

  const handleSubmit = (e) =>{
    deleting.mutate(DeletingItem.id)
    onClose()
  }
  return (
    <div className='grid grid-cols-1 gap-y-3'>
      <p>Voulez vous vraiment supprimer la mention {DeletingItem.text} ?</p>
      <div className="flex flex-row gap-x-3 justify-end">
        <button
          onClick={()=> {onClose()}}
          className="w-[100px] bg-stale text-black border border-slate rounded-lg py-2"
        >
          Annuler
        </button>
        <button
          onClick={()=>{handleSubmit()}}
          className="w-[100px] bg-black text-white rounded-lg py-2"
        >
          Ok
        </button>
      </div>
    </div>
  )
}

function Row(content) {
  const className = 'pl-5'
  return (
    <>
      <td className={`${className}`}>{content.full_name}</td>
      <td className={`${className}`}>{content.username}</td>
      <td className={`${className}`}>{content.email}</td>
      <td className={`${className}`}>{content.mention.code}</td>
      <td className={`${className}`}>{<Badge content={content.is_active ? 'Actif' : 'Inactif'} color={content.is_active ? 'green' : 'red'}/>}</td>
    </>
  )
}
const nomDeTable = ['nom','matricule','email','mention','status']

function UserPanel() {
  const [search,setSearch] = useState('')
  const debouncedSearch = useDebounced(search,1000)
  const [page,setPage] = useState(1)
  const filters = useMemo(() => ({
    ...(debouncedSearch ? { search: debouncedSearch } : {})
  }), [debouncedSearch])
  const {data,isLoading} = useHeads(filters)

  const totalPages = data ? Math.ceil(data.count/PAGE_SIZE) : 0

  const { openModal, closeModal } = useModal()

  const handleAdd = () => {
    openModal({title:'créer un chef',content:<AddEditForm onClose={closeModal}/>})
  }
  const handleEdit = (item) => {
    openModal({title:'Modifier un chef',content:<AddEditForm onClose={closeModal} editingItem={item}/>})
  }
  const handleDelete = (item) => {
    openModal({title:'suppremer un chef', content:<DeleteConfirmForm onClose={closeModal} DeletingItem={item}/>})
  }

  const actions = [
    CreateAction('Modifier','blue',handleEdit,(content)=>{return true},true),
    CreateAction('Supprimer','red',handleDelete,(content)=>{return true},true),
  ]


  return (
    <Card>
      <div className='m-4 flex flex-col flex-1 gap-y-2'>
          <h2>gestion des chefs de département</h2>
          <div className='flex justify-between'>
            <SearchInput
            placeholder='Rechercher un chef'
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
              Ajouter un chef
            </Button>
          </div>
      </div>
      <>
        {isLoading ? <div className='grid grid-cols-1 min-h-[200px] items-center justify-items-center w-full text-xs text-slate-500'>...Chargement</div> :
        <DataTable
        noContentText='Aucune chef trouvée'
        contents={data.results}
        tableheadNames={nomDeTable}
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

export default UserPanel