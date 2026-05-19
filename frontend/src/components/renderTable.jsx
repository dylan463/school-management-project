import { useEffect, useState } from "react"

import Badge from "./badge"
export function CreateAction(title, color, onClick = (content) => { }, contentCondition = (content) => { return true }, condition = true) {
  return { title, color, onClick, contentCondition, condition }
}


function RenderTable({

  renderCondition = true,

  renderFailText = "",

  noContentText = "Aucun élément trouvé",

  contents = [],

  titleBadge = "",

  badgeContent = [],

  clickoutside = 'content',

  actions = [],

  hasSelection = false,

  selectedItem = null,

  onSelectedItem = () => { }

}) {
  // actions [] = [{title,color,onClick,contentCondition,condition}]
  // title = string
  // color = string
  // onClick = (content) => void
  // contentCondition = (content) => boolean
  //condition = boolean

  // badgeContent = [function(content) => {content: string | number, color: string, label: string}]


  const [openMenuId, setOpenMenuId] = useState(null)



  useEffect(() => {

    const handleClickOutside = (event) => {

      if (

        openMenuId &&

        !event.target.closest(`.${clickoutside}-menu-container`)

      ) {

        setOpenMenuId(null)

      }

    }



    document.addEventListener("mousedown", handleClickOutside)



    return () => {

      document.removeEventListener("mousedown", handleClickOutside)

    }

  }, [openMenuId])



  return (

    <div className="p-2 h-96 overflow-y-auto">



      {!renderCondition ? (
        <p className="text-xs text-slate-500">
          {renderFailText}
        </p>
      ) : contents.length === 0 ? (
        <p className="text-xs text-slate-500">
          {noContentText}
        </p>
      ) : (
        contents.map((content) => {
          const contentConditions = actions.map(ac => {
            return (!!ac.contentCondition ? ac.contentCondition(content) : true) && ac.condition
          })
          return (
            <div
              key={content.id}
              className={`relative ${clickoutside}-menu-container`}
            >
              <div
                onClick={() => {
                  if (!hasSelection) return
                  if (content.id === selectedItem?.id) {
                    onSelectedItem(null)
                    return
                  }
                  onSelectedItem(content)
                }}
                className={
                  hasSelection

                    ? `w-full text-left px-3 py-2 rounded-lg text-xs transition-colors mb-1 ${selectedItem?.id === content.id

                      ? "bg-blue-100 text-blue-800 border border-blue-200 font-medium"

                      : "hover:bg-slate-100 text-slate-700"

                    }`

                    : "w-full text-left px-3 py-2 rounded-lg text-xs transition-colors mb-1 hover:bg-slate-100 text-slate-700"

                }

              >
                <div className="flex items-center gap-2 flex-wrap">



                  {titleBadge && (

                    <div className="font-medium">

                      {content[titleBadge]}

                    </div>

                  )}



                  {badgeContent.map(

                    (func, index) => {
                      try {
                        return (
                          <div key={index}>
                            {Badge(func(content))}
                          </div>
                        )
                      } catch (error) {
                        console.log("erreur using :", func)
                        throw error
                      }

                    }

                  )}



                </div>

              </div>
              {contentConditions.includes(true) && (

                <>

                  <button

                    onClick={(e) => {

                      e.stopPropagation()



                      setOpenMenuId(

                        openMenuId === content.id

                          ? null

                          : content.id

                      )

                    }}

                    className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors"

                    title="Actions"

                  >

                    ⋮

                  </button>



                  {openMenuId === content.id && (

                    <div className="absolute right-0 top-8 bg-white border border-slate-200 rounded-lg shadow-lg z-10 w-[100px]">



                      {actions.map(

                        (

                          {

                            title,

                            onClick,

                            color = "blue"
                          },

                          index

                        ) =>
                          contentConditions[index] && (

                            <button

                              key={index}

                              onClick={() => {

                                onClick(content)

                                setOpenMenuId(null)

                              }}

                              className={`w-full text-left px-3 py-2 text-xs text-${color}-600 hover:bg-${color}-50`}

                            >

                              {title}

                            </button>

                          )

                      )}



                    </div>

                  )}

                </>

              )}

            </div>)
        }
        ))

      }

    </div>

  )

}



export default RenderTable