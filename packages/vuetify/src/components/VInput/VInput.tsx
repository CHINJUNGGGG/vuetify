// Styles
import './VInput.sass'

// Components
import { VMessages } from '@/components/VMessages'

// Composables
import { makeDensityProps, useDensity } from '@/composables/density'
import { makeValidationProps, useValidation } from '@/composables/validation'

// Utilities
import { defineComponent, pick, propsFactory } from '@/util'
import { VIcon } from '@/components/VIcon'

// Types
import type { PropType } from 'vue'

export function filterInputAttrs (attrs: Record<string, unknown>) {
  return pick(attrs, ['class', 'style', 'id', /^data-/])
}

export const makeVInputProps = propsFactory({
  appendIcon: String,
  prependIcon: String,
  focused: Boolean,
  hideDetails: [Boolean, String] as PropType<boolean | 'auto'>,
  hint: String,
  messages: {
    type: [Array, String],
    default: () => ([]),
  },
  persistentHint: Boolean,

  ...makeDensityProps(),
  ...makeValidationProps(),
})

export const VInput = defineComponent({
  name: 'VInput',

  props: makeVInputProps(),

  emits: {
    'click:prepend': (e: MouseEvent) => true,
    'click:append': (e: MouseEvent) => true,
  },

  setup (props, { slots, emit }) {
    const { densityClasses } = useDensity(props, 'v-input')
    const { errorMessages, isDisabled, isReadonly, isValid, validationClasses } = useValidation(props, 'v-input')

    return () => {
      const hasPrepend = (slots.prepend || props.prependIcon)
      const hasAppend = (slots.append || props.appendIcon)
      const hasHint = !!(slots.hint || props.hint)
      const hasMessages = !!(slots.messages || props.messages?.length)
      const hasDetails = !props.hideDetails || (
        props.hideDetails === 'auto' && (hasMessages || hasHint)
      )
      const showMessages = hasMessages || (
        hasHint &&
        (props.persistentHint || props.focused)
      )

      return (
        <div class={[
          'v-input',
          densityClasses.value,
          validationClasses.value,
        ]}
        >
          { hasPrepend && (
            <div
              class="v-input__prepend"
              onClick={ e => emit('click:prepend', e) }
            >
              { slots?.prepend?.() }

              { props.prependIcon && (
                <VIcon icon={ props.prependIcon } />
              ) }
            </div>
          ) }

          { slots.default?.({
            isDisabled,
            isReadonly,
            isValid,
            validationClasses,
          }) }

          { hasAppend && (
            <div
              class="v-input__append"
              onClick={ e => emit('click:append', e) }
            >
              { slots?.append?.() }

              { props.appendIcon && (
                <VIcon icon={ props.appendIcon } />
              ) }
            </div>
          ) }

          { hasDetails && (
            <div class="v-input__details">
              <VMessages
                active={ showMessages }
                value={
                  errorMessages.value.length
                    ? errorMessages.value
                    : hasMessages
                      ? props.messages
                      : [props.hint]
                }
                v-slots={{ default: slots.messages }}
              />

              { slots.details?.() }
            </div>
          ) }
        </div>
      )
    }
  },
})

export type VInput = InstanceType<typeof VInput>

export function filterInputProps (attrs: Record<string, unknown>) {
  return pick(attrs, Object.keys(VInput.props))
}