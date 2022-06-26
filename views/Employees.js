import PaginatedTable from "../components/PaginatedTable";
import { View } from "react-native";
import styles from "../styles/styles";
import { Linking } from "react-native";
import { useState } from "react";
import useUser from "../utils/hooks/useUser";

const url = '/employees';

const columns = {
  id: {
    name: 'ID',
    type: 'number',
    hidden: true,
  },
  contract: {
    name: 'Номер кантракта',
    type: 'text',
    hidden: true,
  },
  foremanId: {
    type: 'number',
    hidden: true,
  },
  firstName: {
    name: 'Имя',
    type: 'text',
  },
  lastName: {
    name: 'Фамилия',
    type: 'text',
  },
  photoPath: {
    name: 'Фото',
    type: 'image',
  },
  phone: {
    name: 'Телефон',
    type: 'text',
    hidden: true,
  },
  foreman: {
    name: 'Бригадир',
    type: 'included',
    parse: foreman => foreman ? `${foreman.firstName} ${foreman.lastName}` : 'Нет данных',
    hidden: true,
  },
};

const actions = {
  call: {
    icon: 'cellphone-basic',
    action: emp => {
      Linking.openURL(`tel:+${emp.phone}`);
    },
  },
};

const Employees = props => {
  const me = useUser();
  const [foreman, setForeman] = useState(me.role === 'foreman' ? { foremanId: me.id } : null);

  const filters = {
    fieldsData: {
      foremanId: {
        label: 'Фильтровать по бригаде',
        type: 'fetch-select',
        fetchSelectConfig: {
          url: '/foremen',
          columns: {
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
          },
          showInOption: ['firstName', 'lastName'],
          icon: 'photoPath',
          returnValue: 'id',
        },
        onChangeCallback: id => {
          setForeman(id ? { foremanId: id } : null);
        },
      },
    },
    className: 'inline-form',
    submitable: false,
  };

  return (
    <View style={styles.main}>
      <View style={styles.blockBorderless}>
        <PaginatedTable
          url={url}
          columns={columns}
          actions={actions}
          customFilters={foreman}
          resetCustomFilters={() => setForeman(null)}
          {...(me.role === 'admin' && { filters })}
        />
      </View>
    </View>
  );
};

export default Employees;
