import {useContext} from 'react';
import LanguageContext from "../Language/Lan.jsx";

function Language() {
    const {changeLanguageIndex} = useContext(LanguageContext)
    const selectedValue = localStorage.getItem('langIndex') || '0';

    return (
        <div>
            <select value={selectedValue} onChange={(e) => changeLanguageIndex(e.target.value)}
                    className="bg-gray-50 border border-gray-300 outline-none text-gray-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block p-1 py-2">
                <option disabled>Language</option>
                <option value="0">en</option>
                <option value="1">uz</option>
                <option value="2">ru</option>
            </select>
        </div>
    );
}

export default Language;