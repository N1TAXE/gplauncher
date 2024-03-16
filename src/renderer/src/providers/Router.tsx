import {Navigate, Route, Routes} from "react-router-dom";
import {publicRoutes} from "../utils/paths";
import {MAIN_ROUTE} from "../utils/consts";
import React from "react";
import MainLayout from "../layouts/MainLayout";

export const AppRouter = (): React.ReactElement => {
    return (
        <MainLayout>
            <Routes>
                {publicRoutes.map(({path, Component}) =>
                    <Route key={path} path={path} element={<Component/>}/>
                )}
                <Route path="*" element={<Navigate to={MAIN_ROUTE} />} />
            </Routes>
        </MainLayout>
    );
};
