<script lang="ts">
  import { Checkbox } from '$lib/components/ui/checkbox';
  import { Label } from '$lib/components/ui/label';
  import * as Form from '$lib/components/ui/form';

  export let form;
  export let name: string;
  export let options: { id: string; label: string }[] = [];

  // Bind directly to the form field
  $: selected = $form[name] ?? [];
</script>

<Form.Fieldset {form} {name} class="space-y-0">
  <div class="mb-4">
    <Form.Legend class="text-base capitalize">{name}</Form.Legend>
    <Form.Description>
      Select one or more options.
    </Form.Description>
  </div>

  <div class="space-y-2">
    {#each options as option (option.id)}
      <div class="flex items-start space-x-3">
        <Form.Control>
          {#snippet children({ props })}
            <Checkbox
              {...props}
              checked={selected.includes(option.id)}
              value={option.id}
              onchange={() => {
                if (selected.includes(option.id)) {
                  $form[name] = selected.filter((id) => id !== option.id);
                } else {
                  $form[name] = [...selected, option.id];
                }
              }}
            />
            <Label class="font-normal">{option.label}</Label>
          {/snippet}
        </Form.Control>
      </div>
    {/each}
    <Form.FieldErrors />
  </div>
</Form.Fieldset>
