import PaginatedTable from "../components/PaginatedTable";
import { View } from "react-native";
import styles from "../styles/styles";
import { Linking, Platform } from "react-native";
import { useState } from "react";
import useUser from "../utils/hooks/useUser";
import { Alert } from "react-native";
import request from "../utils/request";
import { Button, Checkbox } from "react-native-paper";

const url = '/employees';

const call = emp => {
  Alert.alert(
    'Save call to history?',
    'This employee will be flagged as "Called".',
    [{
      text: 'Yes',
      onPress: async () => {
        await request({
          url: `/employees/${emp.id}`,
          method: 'PUT',
          body: { called: true },
          callback: (status, response) => {
            if (status !== 'ok') {
              const { message } = response;

              Alert.alert(
                'Error',
                `Failed saving call to history: ${message}`,
                [{ text: 'ОК' }],
              );
            } else {
               Linking.openURL(`tel:+${emp.phone}`);
            }
          },
        });
      }
    }, {
      text: 'No',
      onPress: () => Linking.openURL(`tel:+${emp.phone}`),
    }]
  );
};

const employeeFlags = [
  { value: 'isWorking', text: 'Works', color: '#fc7303' },
  { value: 'printedQR', text: 'QR printed', color: '#03a5fc' },
  { value: 'blacklisted', text: 'Blacklisted', color: '#808080' },
  { value: 'goodWorker', text: 'Good worker', color: '#1e9e05' },
  { value: 'workedBefore', text: 'Worked before', color: '#d9c045' },
  { value: 'wontWork', text: 'Doesn\'t work', color: '#BF156C' },
  { value: 'called', text: 'Called', color: '#c75fed' },
];

const columns = {
  lastName: {
    name: 'Last name',
    type: 'text',
  },
  firstName: {
    name: 'First name',
    type: 'text',
  },
};

const hiddenButRequiredData = [
  'id',
  'foremanId',
  'berryId',
  'phone',
  ...(employeeFlags.map(({ value }) => value)),
];

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

const addFieldsData = {
  firstName: {
    label: 'First name',
    type: 'text',
  },
  lastName: {
    label: 'Last name',
    type: 'text',
  },
  contract: {
    label: 'Contract #',
    type: 'text',
  },
  address: {
    label: 'Address',
    type: 'text',
  },
  phone: {
    label: 'Phone',
    type: 'phone',
  },
  foremanId: {
    label: 'Choose foreman',
    type: 'fetch-select',
    fetchSelectConfig: {
      url: '/foremen',
      columns: foremanColumns,
      showInOption: ['firstName', 'lastName'],
      showInValue: ['firstName', 'lastName'],
      returnValue: 'id',
    }
  },
  photo: {
    label: 'Choose image',
    type: 'file',
  },
};

const chips = Object.fromEntries(employeeFlags.map(({ value, text, color }) => ([
  value,
  {
    show: emp => emp[value],
    label: text,
    style: {
      backgroundColor: color,
      width: text.length * 13 * (0.985**(text.length)),
      height: 30,
    },
    textStyle: {
      fontSize: 11,
    },
  },
])));

const Employees = ({ jumpTo, adding }) => {
  const me = useUser();

  const initFilters = me.role === 'foreman' ? { foremanId: me.id } : {};
  const [customFilters, setCustomFilters] = useState(initFilters);

  const onChangeFilters = values => {
    const { isWorking, called, foremanId } = values;

    setCustomFilters({
      ...(typeof foremanId === 'number' && { foremanId }),
      ...(isWorking && (isWorking !== 'null') && { isWorking }),
      ...(called && (called !== 'null') && { called }),
    });
  };

  const filters = {
    fieldsData: {
      ...(me.role === 'admin' && {
        foremanId: {
          label: 'Filter by brigade (foreman)',
          type: 'fetch-select',
          fetchSelectConfig: {
            url: '/foremen',
            columns: {
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
            },
            showInOption: ['firstName', 'lastName'],
            icon: 'photoPath',
            returnValue: 'id',
          },
        },
      }),
      isWorking: {
        label: 'Filter by "Works"',
        type: 'select',
        selectConfig: {
          options: [
            { value: 'true', label: 'Working' },
            { value: 'false', label: 'Not working' },
            { value: 'null', label: 'All' },
          ],
        },
      },
      called: {
        label: 'Filter by call history',
        type: 'select',
        selectConfig: {
          options: [
            { value: 'true', label: 'Called' },
            { value: 'false', label: 'Not called yet' },
            { value: 'null', label: 'All' },
          ],
        },
      },
    },
    className: 'inline-form',
    submitable: false,
    onChangeCallback: onChangeFilters,
  };

  const onAdd = values => {
    const formData = new FormData();
    
    Object.entries(values).forEach(([key, value]) =>
      formData.append(key, value)
    );

    request({
      url: '/employees',
      method: 'POST',
      body: formData,
      withFiles: true,
      callback: (status, response) => {
        if (status === 'ok') {
          const { firstName, lastName } = response.data;

          Alert.alert(
            'Adding employee',
            `Employee ${firstName} ${lastName} was successfully added`,
            [{ text: 'ОК' }],
          );

          jumpTo('employees', { adding: false });
        } else {
          const { message } = response;

          Alert.alert(
            'Adding employee',
            `Error: ${message}`,
            [{ text: 'ОК' }],
          )
        }
      },
    });
  };

  const actions = {
    call: {
      label: 'Call',
      icon: 'cellphone-basic',
      action: call,
    },
    goToAddress: {
      label: 'Find',
      icon: 'map-marker',
      action: emp => {
        const buttons = [{
          text: 'Cancel',
        }];
  
        if (emp.address) {
          buttons.unshift({
            text: 'Street address',
            onPress: () => {
              const urlMap = Platform.select({
                ios: `maps:0,0?q=${emp.address}`,
                android: `geo:0,0?q=${emp.address}`,
              })
              
              Linking.openURL(urlMap);
            },
          });
        }
  
        if (emp.pickUpAddress) {
          buttons.unshift({
            text: 'Pick up address',
            onPress: () => {
              const urlMap = Platform.select({
                ios: `maps:0,0?q=${emp.pickUpAddress}`,
                android: `geo:0,0?q=${emp.pickUpAddress}`,
              })
              
              Linking.openURL(urlMap);
            },
          });
        }
  
        Alert.alert(
          'Employee\'s address',
          `Living address: ${emp.address || 'No data'}.\nPick up address: ${emp.pickUpAddress || 'No data'}.\nOpen in Maps:\n`,
          buttons,
        );
      },
    },
  };
  

  const pageActions = {
    workTommorow: {
      // icon: <Work />,
      title: selected => `Work (${selected.length} employees)`,
      action: (_, __, refetch, forceLoading, selected, setSelected) => {
        forceLoading(true);

        request({
          url: `/employees/bulkUpdate`,
          method: 'PUT',
          body: {
            ids: selected,
            isWorking: true,
          },
          callback: (status, response) => {
            Alert.alert(
              'Working employees',
              status === 'ok' ? 'Data of working employees was successfully updated' : `Error while updating data of working employees: ${response.message}`,
              [{ text: 'OK' }],
            )
            refetch();

            if (status === 'ok') {
              setSelected([]);
            }
          },
        });
      },
    },
    dontWorkTommorow: {
      // icon: <WorkOff />,
      title: selected => `Don't work (${selected.length} employees)`,
      action: (_, __, refetch, forceLoading, selected, setSelected) => {
        forceLoading(true);

        request({
          url: `/employees/bulkUpdate`,
          method: 'PUT',
          body: {
            ids: selected,
            isWorking: false,
          },
          callback: (status, response) => {
            Alert.alert(
              'Working employees',
              status === 'ok' ? 'Data of working employees was successfully updated' : `Error while updating data of working employees: ${response.message}`,
              [{ text: 'OK' }],
            )
            refetch();

            if (status === 'ok') {
              setSelected([]);
            }
          },
        });
      },
    },
  }

  return (
    <View style={styles.main}>
      <View style={styles.blockBorderless}>
        <PaginatedTable
          url={url}
          columns={columns}
          actions={actions}
          customFilters={customFilters}
          resetCustomFilters={() => setCustomFilters(initFilters)}
          hiddenButRequiredData={hiddenButRequiredData}
          onAdd={onAdd}
          selectOn="id"
          addable={me.role === 'admin'}
          adding={adding}
          chips={chips}
          pageActions={pageActions}
          setAdding={isAdding => jumpTo('employees', { adding: isAdding })}
          addFieldsData={addFieldsData}
          filters={filters}
        />
      </View>
    </View>
  );
};

export default Employees;
