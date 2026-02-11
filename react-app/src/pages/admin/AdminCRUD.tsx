import React from 'react';
import { useParams } from 'react-router-dom';

export const AdminCRUD: React.FC = () => {
    const { table } = useParams<{ table: string }>();
    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold">Manage Table: {table}</h1>
            <p className="text-slate-600">Coming soon...</p>
        </div>
    );
};
