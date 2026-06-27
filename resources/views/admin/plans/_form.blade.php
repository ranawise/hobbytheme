{{-- Shared field set for the Plan create modal (admin/plans/index.blade.php) and
     edit page (admin/plans/view.blade.php). $plan is null when creating. --}}
<div class="row">
    <div class="form-group col-md-6">
        <label class="control-label">Name</label>
        <input type="text" name="name" class="form-control" value="{{ old('name', $plan->name ?? '') }}" />
    </div>
    <div class="form-group col-md-6">
        <label class="control-label">Egg</label>
        <select class="form-control" name="egg_id">
            @foreach ($nests as $nest)
                <optgroup label="{{ $nest->name }}">
                    @foreach ($nest->eggs as $egg)
                        <option value="{{ $egg->id }}" @if((int) old('egg_id', $plan->egg_id ?? 0) === $egg->id) selected @endif>{{ $egg->name }}</option>
                    @endforeach
                </optgroup>
            @endforeach
        </select>
    </div>
    <div class="form-group col-md-12">
        <label class="control-label">Description</label>
        <textarea name="description" class="form-control" rows="2">{{ old('description', $plan->description ?? '') }}</textarea>
    </div>
    <div class="form-group col-md-3">
        <label class="control-label">Memory (MB)</label>
        <input type="number" name="memory" class="form-control" value="{{ old('memory', $plan->memory ?? 1024) }}" />
    </div>
    <div class="form-group col-md-3">
        <label class="control-label">Swap (MB)</label>
        <input type="number" name="swap" class="form-control" value="{{ old('swap', $plan->swap ?? 0) }}" />
    </div>
    <div class="form-group col-md-3">
        <label class="control-label">Disk (MB)</label>
        <input type="number" name="disk" class="form-control" value="{{ old('disk', $plan->disk ?? 1024) }}" />
    </div>
    <div class="form-group col-md-3">
        <label class="control-label">CPU (%)</label>
        <input type="number" name="cpu" class="form-control" value="{{ old('cpu', $plan->cpu ?? 100) }}" />
    </div>
    <div class="form-group col-md-3">
        <label class="control-label">Block I/O Weight</label>
        <input type="number" name="io" class="form-control" value="{{ old('io', $plan->io ?? 500) }}" />
    </div>
    <div class="form-group col-md-3">
        <label class="control-label">Database Limit</label>
        <input type="number" name="database_limit" class="form-control" value="{{ old('database_limit', $plan->database_limit ?? 0) }}" />
    </div>
    <div class="form-group col-md-3">
        <label class="control-label">Allocation Limit</label>
        <input type="number" name="allocation_limit" class="form-control" value="{{ old('allocation_limit', $plan->allocation_limit ?? 1) }}" />
    </div>
    <div class="form-group col-md-3">
        <label class="control-label">Backup Limit</label>
        <input type="number" name="backup_limit" class="form-control" value="{{ old('backup_limit', $plan->backup_limit ?? 0) }}" />
    </div>
    <div class="form-group col-md-4">
        <label class="control-label">Credit Cost</label>
        <input type="number" name="credit_cost" class="form-control" value="{{ old('credit_cost', $plan->credit_cost ?? 0) }}" />
        <p class="text-muted small">How many credits a player spends to create a server with this plan. Use 0 for a free tier.</p>
    </div>
    <div class="form-group col-md-4">
        <label class="control-label">Visible</label>
        <select class="form-control" name="visible">
            <option value="1" @if((bool) old('visible', $plan->visible ?? true)) selected @endif>Yes</option>
            <option value="0" @if(!(bool) old('visible', $plan->visible ?? true)) selected @endif>No</option>
        </select>
    </div>
    <div class="form-group col-md-4">
        <label class="control-label">Sort Order</label>
        <input type="number" name="sort" class="form-control" value="{{ old('sort', $plan->sort ?? 0) }}" />
    </div>
    <div class="form-group col-md-12">
        <label class="control-label">Allowed Nodes</label>
        <div>
            @php($selectedNodes = old('node_ids', $plan?->getNodeIds() ?? []))
            @foreach ($nodes as $node)
                <label class="checkbox-inline" style="display:block;">
                    <input type="checkbox" name="node_ids[]" value="{{ $node->id }}"
                        @if(in_array($node->id, $selectedNodes)) checked @endif>
                    {{ $node->name }}
                </label>
            @endforeach
            <p class="text-muted small">Servers using this plan will only be deployed to the selected node(s).</p>
        </div>
    </div>
</div>
