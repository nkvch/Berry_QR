import { useState, useEffect, useRef, useCallback } from 'react';
import { Button, DataTable, Chip, Modal } from 'react-native-paper';
import Debouncer from '../utils/debouncer';
import useApi from '../utils/hooks/useApi';
import { Avatar, Dialog } from '@rneui/themed';
import { TextInput } from 'react-native-paper';
import { api } from '../api';
import { ScrollView, RefreshControl, Text, View, TouchableOpacity } from 'react-native';
import Form from './Form';
import styles from '../styles/styles';
import { Button as NativeButton } from 'react-native';
// import Form from './Form';
// import styles from '../../styles/PaginatedTable.module.scss';

const debouncer = new Debouncer(500);

const PaginatedTable = props => {
  const { url, columns, actions, chips, tableChips, noSearch, customFilters,
    customAddButton, filters, classNames, resetCustomFilters, onAdd,
    addFieldsData, adding, setAdding, addable, pageActions, selectOn } = props;

  const [page, setPage] = useState(1);
  const [qty, setQty] = useState(10);
  const [search, setSearch] = useState('');

  const [clickedItem, setClickedItem] = useState(null);
  const [selected, setSelected] = useState([]);

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

  const renderActions = actions => Object.entries(actions)
    .map(([name, { icon, label, action, customRender }]) => customRender ? customRender(rows[clickedItem], null, refetch, forceLoading) : (
      <Button
        key={`action-button${clickedItem}${name}`}
        onPress={() => action(rows[clickedItem], null, refetch, forceLoading, setClickedItem)}
        icon={icon}
        color="black"
      >
        {label}
      </Button>
    ));

  const onPressRow = (row, idx) => {
    if (selected.length) {
      const isRowSelected = selected.includes(row[selectOn]);

      setSelected(prev => isRowSelected ? prev.filter(el => el !== row[selectOn]) : [...prev, row[selectOn]]);
    } else {
      setClickedItem(idx);
    };
  };

  const onLongPressRow = row => {
    if (selectOn) {
      setSelected([row[selectOn]]);
    }
  };

  const totallyPages = (qty === -1 || total === 0)
    ? 1
    : Math.ceil(total/qty);

  return adding ? (
    <ScrollView>
      <Form
        onSubmit={onAdd}
        submitText="Сохранить"
        fieldsData={addFieldsData}
        className="wide"
      />
      <View style={styles.mt(10)}>
        <NativeButton
          title="Отменить"
          onPress={() => setAdding(false)}
        />
      </View>
    </ScrollView>
  ) : (
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
          <Form {...filters} intable resetFilters={resetCustomFilters} onChangeCallback={values => {
            if (filters.onChangeCallback) {
              filters.onChangeCallback(values);
            }

            setPage(1);
          }}/>
        )
      }
      <Dialog
        isVisible={Number.isSafeInteger(clickedItem)}
        onPressOut={() => setClickedItem(null)}
      >
        {renderActions(actions)}
      </Dialog>
      <DataTable style={{ overflow: 'visible' }}>
        { tableChips && data ? tableChips.map(({ label, style }, idx) => <Chip key={`customchip${idx}`} style={style}>{label(data)}</Chip>) : null }
        <DataTable.Header>
          {
            Object.values(columns).filter(filterHiddenHeaders).map(({ name }) => (
              <DataTable.Title key={name}>{name}</DataTable.Title>
            ))
          }
        </DataTable.Header>
          {rows.map((row, idx) => (
            <>
              {
                chips ? Object.values(chips).filter(({ show }) => show(row)).map(({ label, style }) => (
                  <Chip style={style} key={`chip${idx}${label}`}>{label}</Chip>
                )) : null
              }
              <TouchableOpacity
                onPress={() => onPressRow(row, idx)}
                onLongPress={() => onLongPressRow(row, idx)}
              >
                <DataTable.Row key={idx} style={selected.includes(row[selectOn]) ? { backgroundColor: '#72c3f2', borderRadius: 5 } : null}>
                  {
                    Object.entries(row).filter(filterHiddenFields).map(([key, value]) => (
                      <DataTable.Cell key={`${idx}${key}${value}`}>
                        {renderCellContend(key, value)}
                      </DataTable.Cell>
                    ))
                  }
                </DataTable.Row>
              </TouchableOpacity>
            </>
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
      {
        addable && adding !== undefined && (
          <View style={{ marginBottom: 8 }}>
            <NativeButton
              title="Добавить"
              onPress={() => setAdding(true)}
            />
          </View>
        )
      }
      {
        pageActions && Object.entries(pageActions).map(([name, { icon, title, action, customRender }]) => customRender ? customRender(data) : (
          <View style={{ marginBottom: 8 }}>
            <NativeButton
              title={title(selected)}
              onPress={() => action(data, null, refetch, forceLoading, selected, setSelected)}
              disabled={!selected.length}
            />
          </View>
        ))
      }
      {
        selected.length ? (
          <View style={{ marginBottom: 8 }}>
            <NativeButton
              title={'Отменить выделенные'}
              onPress={() => setSelected([])}
            />
          </View>
        ) : null
      }
    </ScrollView>
  )
};

export default PaginatedTable;
