import React from 'react'
import { useQuery } from 'react-query'
import { fetchMods } from '../API'
import { ModTypes } from '../../../types'

const ModsPage = () => {
    const { isLoading, error, data } = useQuery<ModTypes[], Error>(
        ['mods'],
        () => fetchMods(),
        {
            refetchOnWindowFocus: true,
        }
    );

    if (isLoading) return <p>Загрузка модов...</p>;
    if (error) return <p>Ошибка: {error.message}</p>;
    return (
        <React.Fragment>
            {data && data.map((item, i) => (
                <div key={i} className="item">
                    <img src={item.icon_url} alt='' />
                    {item.title}
                </div>
            ))}
        </React.Fragment>
    )
}

export default ModsPage
