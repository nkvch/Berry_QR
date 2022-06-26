import { useState, useEffect, useRef, useCallback } from 'react';
import { Button, DataTable } from 'react-native-paper';
import Debouncer from '../utils/debouncer';
import useApi from '../utils/hooks/useApi';
import { Avatar, Dialog } from '@rneui/themed';
import { TextInput } from 'react-native-paper';
import { api } from '../api';
import { ScrollView, RefreshControl, Text, View } from 'react-native';
import Form from './Form';
import styles from '../styles/styles';
// import Form from './Form';
// import styles from '../../styles/PaginatedTable.module.scss';

const debouncer = new Debouncer(500);

const PaginatedTable = props => {
  const { url, columns, actions, noSearch, customFilters, customAddButton, filters, classNames, resetCustomFilters } = props;

  const [page, setPage] = useState(1);
  const [qty, setQty] = useState(10);
  const [search, setSearch] = useState('');

  const searchColumns = Object.entries(columns)
    .filter(([, { type }]) => ['text', 'number'].includes(type))
    .map(([key]) => key);

  const selectColumns = Object.entries(columns)
    .filter(([, { type }]) => type !== 'included')
    .map(([key]) => key);

  const { loading, data, fetchError, refetch, forceLoading } = useApi({ url }, {
    page,
    qty,
    search,
    searchColumns,
    selectColumns,
    ...(customFilters),
  });

  const rows = data?.pageData || [];
  const total = data?.total;

  const handleChangePage = page => {
    setPage(page + 1);
  };

  const handleChangeRowsPerPage = event => {
    setQty(Number(event.target.value));
    setPage(1);
  };

  const handleChangeSearch = value => {
    debouncer.debounce(() => {
      setSearch(value);
      setPage(1);
    });
  };

  const filterHiddenFields = ([key]) => columns[key].hidden !== true;

  const filterHiddenHeaders = ({ hidden }) => hidden !== true;

  const renderCellContend = (key, value) => {
    switch (columns[key].type) {
      case 'image':
        return (
          <Avatar source={{ uri: `${api}${value}` }} />
        );
      case 'included':
        return columns[key].parse(value);
      case 'dateTime':
        return `${new Date(value).toDateString().slice(4)}\n${new Date(value).toLocaleTimeString()}`;
      default:
        return value;
    }
  };

  const renderActions = (actions, idx) => Object.entries(actions)
    .map(([, { icon, tooltip, action }]) => (
      <Button
        key={`action-button${idx}`}
        onPress={() => action(rows[idx], null, refetch, forceLoading)}
        icon={icon}
        color="black"
      />
    ));

  const totallyPages = (qty === -1 || total === 0)
    ? 1
    : Math.ceil(total/qty);

  return (
    <ScrollView
      refreshControl={
        <RefreshControl
          refreshing={loading}
          onRefresh={() => { forceLoading(); refetch(); }}
        />
      }
      style={{ height: '100%' }}
    >
      {
        !noSearch && (
          <TextInput
            key="tablesearch"
            label="Поиск..."
            onChangeText={handleChangeSearch}
            mode="outline"
            selectionColor="black"
            style={styles.mb(5)}
            theme={{
              colors: {
                         placeholder: 'black', text: 'black', primary: 'black',
                         underlineColor: 'transparent', background: 'white'
                 }
           }}
          />
        )
      }
      {
        filters && (
          <Form {...filters} intable resetFilters={resetCustomFilters} />
        )
      }
      <DataTable style={{ overflow: 'visible' }}>
        <DataTable.Header>
          {
            Object.values(columns).filter(filterHiddenHeaders).map(({ name }) => (
              <DataTable.Title key={name}>{name}</DataTable.Title>
            ))
          }
          {
            actions
              ? (
                <DataTable.Title key="actions-header">Действия</DataTable.Title>
              )
              : null
          }
        </DataTable.Header>
          {rows.map((row, idx) => (
            <DataTable.Row key={idx}>
              {
                Object.entries(row).filter(filterHiddenFields).map(([key, value]) => (
                  <DataTable.Cell key={`${idx}${key}${value}`}>
                    {renderCellContend(key, value)}
                  </DataTable.Cell>
                ))
              }
              {
                actions
                  ? (
                    <DataTable.Cell key={`${idx}-actions`}>
                      {renderActions(actions, idx)}
                    </DataTable.Cell>
                  )
                  : null
              }
            </DataTable.Row>
          ))}

        <DataTable.Pagination
          numberOfPages={totallyPages}
          itemsPerPage={qty}
          page={page - 1}
          optionsLabel={'Результатов на странице'}
          label={`${page}-${totallyPages}`}
          onPageChange={handleChangePage}
          onItemsPerPageChange={handleChangeRowsPerPage}
          showFastPaginationControls
        />
      </DataTable>
      {/* <Button
        variant="contained"
        style={{ marginTop: '1em' }}
        onClick={customAddButton || (() => router.push(`${url}/create`))}
      >
        Добавить
      </Button> */}
    </ScrollView>
  )
};

export default PaginatedTable;
