
import { useState } from "react";
import { Alert, Button, View } from "react-native";
import Form from "../components/Form";
import PaginatedTable from "../components/PaginatedTable";
import styles from "../styles/styles";
import useUser from "../utils/hooks/useUser";
import request from "../utils/request";
import parsePrice from "../utils/parsePrice";
import getStartOfToday from "../utils/getStartOfToday";

const employeeFlags = [
  { value: 'isWorking', text: 'Работает', color: '#fc7303' },
  { value: 'printedQR', text: 'QR распечатан', color: '#03a5fc' },
  { value: 'blacklisted', text: 'Черный список', color: '#808080' },
  { value: 'goodWorker', text: 'Хороший работник', color: '#1e9e05' },
  { value: 'workedBefore', text: 'Работал прежде', color: '#d9c045' },
  { value: 'called', text: 'Звонили', color: '#c75fed' },
];

const employeeColumns = {
  id: {
    name: 'id',
    type: 'number',
  },
  photoPath: {
    name: 'Фото',
    type: 'image',
  },
  firstName: {
    name: 'Имя',
    type: 'text',
  },
  lastName: {
    name: 'Фамилия',
    type: 'text',
  },
};

const productColumns = {
  id: {
    name: 'id',
    type: 'number',
  },
  photoPath: {
    name: 'Фото',
    type: 'image',
  },
  productName: {
    name: 'Имя',
    type: 'text',
  },
};

const foremanColumns = {
  id: {
    name: 'id',
    type: 'number',
  },
  firstName: {
    name: 'Имя',
    type: 'text',
  },
  lastName: {
    name: 'Фамилия',
    type: 'text',
  },
};

const columns = {
  amount: {
    name: 'Количество (кг)',
    type: 'number',
  },
  dateTime: {
    name: 'Дата и время',
    type: 'dateTime',
  },
  employee: {
    name: 'Сотрудник',
    type: 'included',
    parse: emp => emp ? `${emp.firstName} ${emp.lastName}` : 'Нет данных',
  },
};

const hiddenButRequiredData = ['employeeId', 'productId'];

const summarizeCols = {
  employee: {
    name: 'Сотрудник',
    type: 'included',
    parse: emp => emp ? `${emp.firstName} ${emp.lastName}` : 'Нет данных',
  },
  allAmount: {
    name: 'Все количество',
    type: 'custom',
    render: num => `${num.toFixed(2)} кг`,
  },
  allPrice: {
    name: 'Вся сумма',
    type: 'custom',
    render: num => parsePrice(num),
  },
};

const actions = {
  delete: {
    label: 'Удалить',
    icon: 'delete',
    action: (rec, _, refetch, forceLoading, setClickedItem) => {
      Alert.alert(
        'Удаление записи из истории',
        `Вы действительно хотите запись ${rec.id} ${rec.employee?.firstName || ''} ${rec.employee?.lastName || ''} ${rec.product?.productName || ''} ${rec.amount}?`,
        [{
          text: 'Удалить',
          onPress: () => {
            forceLoading(true);

            request({
              url: `/history/${rec.id}`,
              method: 'DELETE',
              callback: (status, response) => {
                if (status === 'ok') {
                  Alert.alert(
                    'Запись успешно удалена',
                    ''
                    [{ text: 'OK' }],
                  );
                  setClickedItem(null);
                  refetch();
                } else {
                  Alert.alert(
                    'Ошибка при удалении записи',
                    response.message,
                    [{ text: 'OK' }],
                  );
                };
              },
            });
          },
          style: 'destructive',
        }, {
          text: 'Отменить',
          onPress: () => {},
          style: 'cancel',
        }],
      )
    },
  },
};

const Stats = props => {
  const me = useUser();

  const [showFilters, setShowFilters] = useState(false);
  const [summarize, setSummarize] = useState(true);

  const defaultSort = summarize ? 'allAmount desc' : 'history.dateTime desc';

  const [defaultSortColumn, defaultSorting] = defaultSort.split(' ');

  const initFilters = {
    sortColumn: defaultSortColumn,
    sorting: defaultSorting,
    fromDateTime: getStartOfToday().toISOString(),
  };

  const [filters, setFilters] = useState(initFilters);

  const fieldsData = {
    ...(me.role === 'admin' && {
      foreman: {
        label: 'Бригадир',
        type: 'fetch-select',
        fetchSelectConfig: {
          url: '/foremen',
          columns: foremanColumns,
          showInOption: ['firstName', 'lastName'],
          icon: 'photoPath',
          returnValue: 'id',
        },
      },
    }),
    employee: {
      label: 'Сотрудник',
      type: 'fetch-select',
      fetchSelectConfig: {
        url: '/employees',
        columns: employeeColumns,
        showInOption: ['firstName', 'lastName'],
        icon: 'photoPath',
        returnValue: 'id',
      },
    },
    flagsPresent: {
      label: 'Фильтровать по наличию флага',
      type: 'multiple-select',
      defaultValue: [],
      multipleSelectConfig: {
        multipleOptions: employeeFlags.map(({ value, text }) => ({ value, label: text })),
      },
    },
    flagsAbsent: {
      label: 'Фильтровать по отсутствию флага',
      type: 'multiple-select',
      defaultValue: [],
      multipleSelectConfig: {
        multipleOptions: employeeFlags.map(({ value, text }) => ({ value, label: text })),
      },
    },
    sortFilters: {
      label: 'Сортировать',
      type: 'select',
      selectConfig: {
        options: summarize ? [
          { value: 'employee.lastName asc', label: 'По алфавиту' },
          { value: 'allAmount desc', label: 'От самого большого' },
          { value: 'allAmount asc', label: 'От самого маленького' },
        ] : [
          { value: 'history.dateTime desc', label: 'От недавнего' },
          { value: 'history.dateTIme asc', label: 'От давнего' }
        ],
      },
      defaultValue: defaultSort,
    },
    fromDateTime: {
      label: 'От',
      type: 'datetime',
      defaultValue: getStartOfToday(),
    },
    toDateTime: {
      label: 'До',
      type: 'datetime',
    },
  };

  const pageActions = {
    summarize: {
      title: () => summarize ? 'История' : 'Рассчитать',
      action: () => {
        const newSummarize = !summarize;

        setFilters(({ sortColumn, ...rest }) => ({
          ...rest,
          sortColumn: newSummarize ? 'allAmount' : 'history.dateTime',
          sorting: 'desc',
        }));

        setSummarize(newSummarize);
      },
      disabled: false,
    },
  };

  const tableChips = [{
    label: data => data?.totalAmount ? `Итого ${data.totalAmount.allAmount.toFixed(2)} кг или ${parsePrice(data.totalAmount.allPrice)}` : '',
    style: {
      backgroundColor: 'rgba(0, 128, 0, 0.564)',
      marginTop: 8,
    },
  }];

  const onChangeFilters = ({ fromDateTime, toDateTime, sortFilters, flagsPresent, flagsAbsent, ...restFilters }) => {
    const [sortColumn, sorting] = sortFilters?.split(' ') || [];

    setFilters({
      ...Object.fromEntries(Object.entries({ ...restFilters, sortColumn, sorting }).filter(([_, val]) => val !== undefined)),

      ...(fromDateTime && {
        fromDateTime: fromDateTime.toISOString(),
      }),

      ...(toDateTime && {
        toDateTime: toDateTime.toISOString(),
      }),

      ...(me.role === 'foreman' && {
        foreman: me.id,
      }),

      ...(Object.fromEntries(flagsPresent.map(flag => ([flag, true])))),
      ...(Object.fromEntries(flagsAbsent.map(flag => ([flag, false])))),
    });
    setShowFilters(false);
  };

  return (
    <View style={styles.main}>
      <View style={styles.blockBorderless}>
        <Form
          fieldsData={fieldsData}
          onSubmit={onChangeFilters}
          submitText="Фильтровать"
          resetable
          resetText="Сбросить фильтры (всё за сегодня)"
          hidden={!showFilters}
        />
        {
          !showFilters && (
            <>
              <Button
                title="Фильтры"
                onPress={() => setShowFilters(true)}
              />
              <PaginatedTable
                url="/history"
                columns={summarize ? summarizeCols : columns}
                tableChips={tableChips}
                pageActions={pageActions}
                noSearch
                customFilters={{ ...filters, summarize }}
                actions={summarize ? null : actions}
                hiddenButRequiredData={hiddenButRequiredData}
              />
          </>
          )
        }
      </View>
    </View>
  )
};

export default Stats;
