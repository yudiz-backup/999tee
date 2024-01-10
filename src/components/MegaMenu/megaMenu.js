import React from 'react';
import { useNavigation } from '../../peregrine/lib/talons/MegaMenu/useMegaMenu';
import { Link, resourceUrl } from 'src/drivers';
import defaultClasses from './megaMenu.css';
import $ from 'jquery';
import { NavLink } from 'react-router-dom';
import { isMobileView } from '../../util/helperFunction';

const MegaMenu = () => {
    const talonsProps = useNavigation();
    const mobileView = isMobileView();
    const navItems = [];

    const { navdetails } = talonsProps;
    if (typeof navdetails != 'undefined' && navdetails && !mobileView) {
        const elements = JSON.parse(navdetails).categories;
        if (elements) {
            $.each(elements, function (i, v) {
                if (v['main_category_id']) {
                    navItems.push(
                        <li
                            key={i}
                            className={
                                defaultClasses.item +
                                ' ' +
                                defaultClasses.haschild +
                                ' ' +
                                defaultClasses.mainLink
                            }
                        >
                            <NavLink
                                isActive={() =>
                                    resourceUrl('/' + v['main_category_url']).split('/')[1].split('.')[0] === (location.pathname.split('/')[0] || location.pathname.split('/')[1].split('.')[0])}
                                to={resourceUrl('/' + v['main_category_url'])}
                            >
                                {v['main_category_name']}
                            </NavLink>
                            <ul key={i + 'mainul'} className={defaultClasses.sub_menu}>
                                {typeof v['sub_cats'] != 'undefined' &&
                                    v['sub_cats'].map((v1, i1) => {
                                        let showsubchild = true;
                                        let hasSubchild =
                                            defaultClasses.has_child;
                                        if (v1['sub_cats'].length) {
                                            showsubchild = true;
                                            hasSubchild =
                                                defaultClasses.has_child;
                                        } else {
                                            hasSubchild =
                                                defaultClasses.no_child;
                                            showsubchild = false;
                                        }
                                        return (
                                            <li key={i1 + 'sub'} className={hasSubchild}>
                                                <Link
                                                    to={resourceUrl(
                                                        '/' +
                                                        v1[
                                                        'sub_category_url'
                                                        ]
                                                    )}
                                                >
                                                    {v1['sub_category_name']}
                                                </Link>
                                                {showsubchild && (
                                                    <ul
                                                        className={
                                                            defaultClasses.lavel_2
                                                        }
                                                    >
                                                        {v1['sub_cats'].map(
                                                            (v2, i2) => {
                                                                return (
                                                                    <li
                                                                        key={
                                                                            i2 +
                                                                            'supersub'
                                                                        }
                                                                    >
                                                                        <Link
                                                                            to={resourceUrl(
                                                                                '/' +
                                                                                v2[
                                                                                'category_url'
                                                                                ]
                                                                            )}
                                                                        >
                                                                            {
                                                                                v2[
                                                                                'category_name'
                                                                                ]
                                                                            }
                                                                        </Link>
                                                                    </li>
                                                                );
                                                            }
                                                        )}
                                                    </ul>
                                                )}
                                            </li>
                                        );
                                    })}
                            </ul>

                        </li>
                    );
                }
            });
        }
    }
    return (
        <>
            {!mobileView && (
                <div className={defaultClasses.main_navigation}>
                    <div className="container">
                        <div className="row">
                            <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                                <ul className={defaultClasses.ced_megamenu}>
                                    {navItems}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default MegaMenu;
