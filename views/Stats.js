
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
  { value: 'isWorking', text: 'Works', color: '#fc7303' },
  { value: 'printedQR', text: 'QR printed', color: '#03a5fc' },
  { value: 'blacklisted', text: 'Blacklisted', color: '#808080' },
  { value: 'goodWorker', text: 'Good worker', color: '#1e9e05' },
  { value: 'workedBefore', text: 'Worked before', color: '#d9c045' },
  { value: 'called', text: 'Called', color: '#c75fed' },
];

const employeeColumns = {
  id: {
    name: 'id',
    type: 'number',
  },
  photoPath: {
    name: 'Photo',
    type: 'image',
  },
  firstName: {
    name: 'First name',
    type: 'text',
  },
  lastName: {
    name: 'Last name',
    type: 'text',
  },
};

const productColumns = {
  id: {
    name: 'id',
    type: 'number',
  },
  photoPath: {
    name: 'Photo',
    type: 'image',
  },
  productName: {
    name: 'First name',
    type: 'text',
  },
};

const foremanColumns = {
  id: {
    name: 'id',
    type: 'number',
  },
  firstName: {
    name: 'First name',
    type: 'text',
  },
  lastName: {
    name: 'Last name',
    type: 'text',
  },
};

const columns = {
  amount: {
    name: 'Amount (kg)',
    type: 'number',
  },
  dateTime: {
    name: 'Date and time',
    type: 'dateTime',
  },
  employee: {
    name: 'Employee',
    type: 'included',
    parse: emp => emp ? `${emp.firstName} ${emp.lastName}` : 'No data',
  },
};

const hiddenButRequiredData = ['employeeId', 'productId'];

const summarizeCols = {
  employee: {
    name: 'Employee',
    type: 'included',
    parse: emp => emp ? `${emp.firstName} ${emp.lastName}` : 'No data',
  },
  allAmount: {
    name: 'All amount',
    type: 'custom',
    render: num => `${num.toFixed(2)} kg`,
  },
  allPrice: {
    name: 'All price',
    type: 'custom',
    render: num => parsePrice(num),
  },
};

const actions = {
  delete: {
    label: 'Delete',
    icon: 'delete',
    action: (rec, _, refetch, forceLoading, setClickedItem) => {
      Alert.alert(
        'Deleting record from history',
        `Are you sure you want to delete record ${rec.id} ${rec.employee?.firstName || ''} ${rec.employee?.lastName || ''} ${rec.product?.productName || ''} ${rec.amount}?`,
        [{
          text: 'Delete',
          onPress: () => {
            forceLoading(true);

            request({
              url: `/history/${rec.id}`,
              method: 'DELETE',
              callback: (status, response) => {
                if (status === 'ok') {
                  Alert.alert(
                    'Record was successfully deleted',
                    ''
                    [{ text: 'OK' }],
                  );
                  setClickedItem(null);
                  refetch();
                } else {
                  Alert.alert(
                    'Error while deleting record',
                    response.message,
                    [{ text: 'OK' }],
                  );
                };
              },
            });
          },
          style: 'destructive',
        }, {
          text: 'Cancel',
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
    // fromDateTime: getStartOfToday().toISOString(),
  };

  const [filters, setFilters] = useState(initFilters);

  const fieldsData = {
    ...(me.role === 'admin' && {
      foreman: {
        label: 'Foreman',
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
      label: 'Employee',
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
      label: 'Filter by flags present',
      type: 'multiple-select',
      defaultValue: [],
      multipleSelectConfig: {
        multipleOptions: employeeFlags.map(({ value, text }) => ({ value, label: text })),
      },
    },
    flagsAbsent: {
      label: 'Filter by flags absent',
      type: 'multiple-select',
      defaultValue: [],
      multipleSelectConfig: {
        multipleOptions: employeeFlags.map(({ value, text }) => ({ value, label: text })),
      },
    },
    sortFilters: {
      label: 'Sort',
      type: 'select',
      selectConfig: {
        options: summarize ? [
          { value: 'employee.lastName asc', label: 'By alphabet' },
          { value: 'allAmount desc', label: 'From the most' },
          { value: 'allAmount asc', label: 'From the least' },
        ] : [
          { value: 'history.dateTime desc', label: 'From newest' },
          { value: 'history.dateTIme asc', label: 'From oldest' }
        ],
      },
      defaultValue: defaultSort,
    },
    fromDateTime: {
      label: 'From',
      type: 'datetime',
      // defaultValue: getStartOfToday(),
    },
    toDateTime: {
      label: 'To',
      type: 'datetime',
    },
  };

  const pageActions = {
    summarize: {
      title: () => summarize ? 'History' : 'Summarize',
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
    label: data => data?.totalAmount ? `Total amount: ${data.totalAmount.allAmount.toFixed(2)} kg or ${parsePrice(data.totalAmount.allPrice)}` : '',
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
          submitText="Filter"
          resetable
          resetText="Clear filters"
          hidden={!showFilters}
        />
        {
          !showFilters && (
            <>
              <Button
                title="Filters"
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
